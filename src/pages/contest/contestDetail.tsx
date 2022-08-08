import {
    Box,
    Table,
    TableContainer,
    Tbody,
    Td,
    Tr,
    Progress,
    Button,
    ButtonGroup,
    Tag,
    HStack,
    Th,
    Thead,
    Link,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Input,
    InputGroup,
    InputLeftElement,
    useToast,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)

import { ReactTabulator } from 'react-tabulator'
import { Tabulator } from 'react-tabulator/lib/types/TabulatorTypes'
import 'react-tabulator/lib/styles.css'
import 'react-tabulator/lib/css/tabulator_semanticui.min.css'
import '~/css/tabulator.css'
import { ExternalLinkIcon, SmallAddIcon, SmallCloseIcon } from '@chakra-ui/icons'
import { FaFacebook, FaLine, FaLock, FaTwitter } from 'react-icons/fa'
import { truncate } from 'lodash'
import { Helmet } from 'react-helmet-async'
import { Link as ReactLink } from 'react-router-dom'
import jssha from 'jssha'
import { Auth } from 'aws-amplify'
import { Buffer } from 'buffer'

type IRData = {
    [key: string]: any
    total: number
}

type SongData = {
    artist: string
    bpm: number
    datetime: string
    genre: string
    judgerank: number
    level: string
    maxbpm: number
    minbpm: number
    mode: string
    notes: number
    songhash: string
    title: string
    total: number
    lnmode?: number
    video?: {
        videoid: string
        updateUserId: string
    }
}

type CourseData = {
    courcehash: string
    datetime: string
    name: string
    status: string
    songs: string
    constraints: string[]
}

export default () => {
    const toast = useToast()
    const navigate = useNavigate()
    const urlParams = useParams<{ contestId: string }>()
    const [irData, setIRData] = useState<IRData[]>([])
    const [courseData, setCourseData] = useState<{ contestData: any; contestSongDatas: SongData[] }>()
    const [isLoading, setLoading] = useState(false)

    const columns = useMemo<Tabulator.ColumnDefinition[]>(() => {
        const columns = [
            { formatter: 'rownum', align: 'center', width: 40, headerSort: false, resizable: false },
            {
                title: 'Name',
                field: 'username',
                resizable: false,
                minWidth: 150,
                headerSort: false,
                formatter: function (cell: Tabulator.CellComponent, formatterParams: any) {
                    let data = cell.getRow().getData()
                    let userid = data.userid
                    return `<a href="./#/viewer/user/${userid}">${cell.getValue()}</a>`
                },
            },
        ] as any[]
        let totalMaxExScore = 0
        for (let songhash of courseData?.contestData.songs ?? []) {
            const sh = songhash.split('.')[0]
            const ln = songhash.split('.')[1]
            const lnString = ln == 0 ? 'LN or Default' : ln == 1 ? 'CN' : 'HCN'
            const songData = courseData?.contestSongDatas.find((element) => {
                return element.songhash == sh
            })
            const cl = {
                title: songData!.title + `<br>(LNMode: ${lnString})`,
                field: sh + '-' + ln,
                align: 'left',
                formatter: 'progress',
                formatterParams: { min: 0, max: songData!.notes * 2, legend: true },
                headerSort: false,
                minWidth: 150,
                resizable: false,
            }
            totalMaxExScore = totalMaxExScore + songData!.notes * 2
            columns.push(cl)
        }
        columns.push({
            title: 'Total Score',
            field: 'total',
            align: 'left',
            formatter: 'progress',
            formatterParams: {
                min: 0,
                max: totalMaxExScore,
                color: 'orange',
                legend: true,
            },
            headerSort: false,
            minWidth: 150,
            resizable: false,
        })
        return columns
    }, [courseData])

    const contestDatetime = useMemo(() => {
        return {
            start: courseData?.contestData?.startDateTime
                ? dayjs(courseData?.contestData?.startDateTime).format('YYYY/MM/DD HH:mm:ssZZ')
                : '',
            end: courseData?.contestData?.endDateTime
                ? dayjs(courseData?.contestData?.endDateTime).format('YYYY/MM/DD HH:mm:ssZZ')
                : '',
        }
    }, [courseData])

    useEffect(() => {
        setLoading(true)
        setIRData([])
        setCourseData(undefined)
        getCourseData()
    }, [urlParams.contestId])

    const getCourseData = async () => {
        const ks = getAccessKeyAndSecret('get_contest').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'get_contest',
            Payload: Buffer.from(
                JSON.stringify({
                    contestId: urlParams.contestId,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            if (json.message == 'success') {
                console.log(json)
                setIRData(createScoreDataView(json.contestData, json.contestSongDatas, json.contestScoreDatas))
                setCourseData({ contestData: json.contestData, contestSongDatas: json.contestSongDatas })
            } else {
            }
        } catch {
        } finally {
            setLoading(false)
        }
    }

    const createScoreDataView = (contestData: any, songDatas: any[], scoreDatas: any[]) => {
        const scores = [] as IRData[]

        for (let score of scoreDatas) {
            const userData = {} as IRData
            userData.username = score.username
            userData.userid = score.userid
            let totalExScore = 0
            for (let songhash of contestData.songs) {
                const sh = songhash.split('.')[0]
                const ln = songhash.split('.')[1]
                const songScore = score.scores.find((element: any) => {
                    return element.songhash == songhash
                })
                if (!songScore) {
                    userData[sh + '-' + ln] = 0
                    continue
                } else {
                    userData[sh + '-' + ln] = songScore.score
                    totalExScore = totalExScore + songScore.score
                }
            }

            userData.total = totalExScore
            // console.log(userData);
            scores.push(userData)
        }
        scores.sort((a, b) => {
            return b.total - a.total
        })
        return scores
    }

    const rowFormatter = (row: Tabulator.RowComponent) => {
        if (row.getData().novalidate) {
            row.getElement().style.backgroundColor = '#A6A6DF'
        }
    }

    const openInNewTab = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const socialText = (title: string) => {
        return `[MinIR Contest]%0D%0A${truncate(title, {
            length: 120,
        })}`
    }
    const socialUrl = (hash: string) => {
        return `https://www.gaftalk.com/minir/%23/viewer/contest/${hash}`
    }
    const socialTwitter = useMemo(() => {
        return () => {
            openInNewTab(
                `https://twitter.com/intent/tweet?text=${socialText(courseData?.contestData?.contestName ?? '')}%0D%0A${socialUrl(
                    urlParams.contestId ?? '',
                )}`,
            )
        }
    }, [courseData])
    const socialFacebook = useMemo(() => {
        return () => {
            openInNewTab(
                `https://www.facebook.com/sharer.php?quote=${socialText(
                    courseData?.contestData?.contestName ?? '',
                )}&u=${socialUrl(urlParams.contestId ?? '')}`,
            )
        }
    }, [courseData])

    const socialLine = useMemo(() => {
        return () => {
            openInNewTab(
                `https://social-plugins.line.me/lineit/share?text=${socialText(
                    courseData?.contestData?.name ?? '',
                )}&url=${socialUrl(urlParams.contestId ?? '')}`,
            )
        }
    }, [courseData])

    const [password, setPassword] = useState<string>()
    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const isPasswordContest = useMemo(() => {
        console.log(!!courseData?.contestData?.password)
        return !!courseData?.contestData?.password
    }, [courseData])

    const enableJoinButton = useMemo(() => {
        if (!courseData?.contestData?.password) {
            return true
        }

        if (!password || password === '') {
            return false
        }

        const shaObj = new jssha('SHA-512', 'TEXT')
        shaObj.update(password)
        const _password = shaObj.getHash('HEX')

        if (courseData.contestData.password == _password) {
            return true
        }

        return false
    }, [password, courseData])

    const isBeforeDate = useMemo(() => {
        if (!courseData?.contestData?.endDateTime) return true
        return dayjs().isSameOrBefore(dayjs(courseData.contestData.endDateTime), 'day')
    }, [courseData])

    const [isContestLoading, setContestLoading] = useState(false)

    const joinContest = async () => {
        setContestLoading(true)
        const data = await Auth.currentAuthenticatedUser()
        const userData = {
            AccessToken: data.signInUserSession.accessToken.jwtToken,
            RefreshToken: data.signInUserSession.refreshToken.token,
            UserId: data.signInUserSession.idToken.payload.sub,
        }

        const ks = getAccessKeyAndSecret('join_contest').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'join_contest',
            Payload: Buffer.from(
                JSON.stringify({
                    AccessToken: userData.AccessToken,
                    RefreshToken: userData.RefreshToken,
                    contestId: urlParams.contestId,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            if (json.message == 'success') {
                toast({
                    description: 'Successfully join Contest.',
                    status: 'success',
                    duration: 1500,
                })
            } else if (json.message == 'join_limit') {
                toast({
                    description: 'Join Limit. Please leave other Contest.',
                    status: 'error',
                    duration: 1500,
                })
            } else {
                toast({
                    description: 'Failed to join Contest.',
                    status: 'error',
                    duration: 1500,
                })
            }
        } catch (e) {
            toast({
                description: 'Failed to join Contest.',
                status: 'error',
                duration: 1500,
            })
        } finally {
            setContestLoading(false)
        }
    }

    const leaveContest = async () => {
        setContestLoading(true)
        const data = await Auth.currentAuthenticatedUser()
        const userData = {
            AccessToken: data.signInUserSession.accessToken.jwtToken,
            RefreshToken: data.signInUserSession.refreshToken.token,
            UserId: data.signInUserSession.idToken.payload.sub,
        }

        const ks = getAccessKeyAndSecret('leave_contest').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'leave_contest',
            Payload: Buffer.from(
                JSON.stringify({
                    AccessToken: userData.AccessToken,
                    RefreshToken: userData.RefreshToken,
                    contestId: urlParams.contestId,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            if (json.message == 'success') {
                toast({
                    description: 'Successfully leave Contest.',
                    status: 'success',
                    duration: 1500,
                })
            } else {
                toast({
                    description: 'Failed to leave Contest.',
                    status: 'error',
                    duration: 1500,
                })
            }
        } catch (e) {
            toast({
                description: 'Failed to leave Contest.',
                status: 'error',
                duration: 1500,
            })
        } finally {
            setContestLoading(false)
        }
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>{courseData?.contestData?.name ?? 'MinIR'}</title>
            </Helmet>
            <Box padding={4}>
                {isLoading && <Progress size="xs" isIndeterminate />}
                <TableContainer>
                    <Table size="sm">
                        <Tbody>
                            <Tr>
                                <Td>TITLE</Td>
                                <Td>{courseData?.contestData?.contestName}</Td>
                            </Tr>
                            <Tr>
                                <Td>DESCRIPTION</Td>
                                <Td>{courseData?.contestData?.description}</Td>
                            </Tr>
                            <Tr>
                                <Td>DATETIME</Td>
                                <Td>
                                    {contestDatetime.start} - {contestDatetime.end}
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>OWNER</Td>
                                <Td>{courseData?.contestData?.createUserName}</Td>
                            </Tr>
                            <Tr>
                                <Td>SOCIAL</Td>
                                <Td>
                                    <ButtonGroup variant="outline" spacing="2">
                                        <Button
                                            colorScheme="twitter"
                                            leftIcon={<FaTwitter />}
                                            size={'xs'}
                                            onClick={() => socialTwitter()}>
                                            Twitter
                                        </Button>
                                        <Button
                                            colorScheme="facebook"
                                            leftIcon={<FaFacebook />}
                                            size={'xs'}
                                            onClick={() => socialFacebook()}>
                                            Facebook
                                        </Button>
                                        <Button color="#06c755" leftIcon={<FaLine />} size={'xs'} onClick={() => socialLine()}>
                                            Line
                                        </Button>
                                    </ButtonGroup>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
                <Box mt={'-px'}>
                    <Accordion allowToggle>
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left">
                                        Contest Songs
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <TableContainer>
                                    <Table size="xs">
                                        <Thead>
                                            <Tr>
                                                <Th w={'32px'}></Th>
                                                <Th w={'32px'}>IR</Th>
                                                <Th>TITLE</Th>
                                                <Th>LNMODE</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {courseData?.contestSongDatas.map((s, index) => (
                                                <Tr key={index}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>
                                                        <Link as={ReactLink} to={`/viewer/song/${s.songhash}/${s.lnmode}`}>
                                                            <ExternalLinkIcon />
                                                        </Link>
                                                    </Td>
                                                    <Td>{s?.title}</Td>
                                                    <Td>{s.lnmode}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </Box>
                <Box m={2} p={2} shadow={'md'}>
                    {isPasswordContest && (
                        <InputGroup mb={2}>
                            <InputLeftElement pointerEvents="none" color="gray.300" children={<FaLock color="#CBD5E0" />} />
                            <Input
                                name="password"
                                type="text"
                                placeholder="Contest password"
                                onChange={changePassword}
                                value={password}
                            />
                        </InputGroup>
                    )}
                    <ButtonGroup variant="outline" spacing="2">
                        {isBeforeDate && (
                            <Button
                                colorScheme="green"
                                leftIcon={<SmallAddIcon />}
                                size={'sm'}
                                disabled={!enableJoinButton}
                                isLoading={isContestLoading}
                                onClick={() => joinContest()}>
                                Join Contest
                            </Button>
                        )}

                        <Button
                            colorScheme="red"
                            leftIcon={<SmallCloseIcon />}
                            size={'sm'}
                            isLoading={isContestLoading}
                            onClick={() => leaveContest()}>
                            Leave Contest
                        </Button>
                    </ButtonGroup>
                </Box>
                <ReactTabulator
                    className={'compact'}
                    data={irData}
                    columns={columns}
                    options={{
                        responsiveLayout: true,
                        pagination: 'local',
                        paginationSize: 30,
                        layout: 'fitColumns',
                        rowFormatter,
                    }}
                />
            </Box>
        </DefaultLayout>
    )
}
