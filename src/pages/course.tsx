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
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import Lambda from 'aws-sdk/clients/lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import AWS from 'aws-sdk'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'

import { ReactTabulator } from 'react-tabulator'
import { Tabulator } from 'react-tabulator/lib/types/TabulatorTypes'
import 'react-tabulator/lib/styles.css'
import 'react-tabulator/lib/css/tabulator_semanticui.min.css'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { FaFacebook, FaLine, FaTwitter } from 'react-icons/fa'
import { truncate } from 'lodash'
import { Helmet } from 'react-helmet-async'
import { Link as ReactLink } from 'react-router-dom'

type IRData = {
    clear: number
    combo: number
    datetime: string
    egr: number
    epg: number
    lgr: number
    lpg: number
    notes: number
    novalidate: boolean
    score: number
    songhash: string
    userid: string
    username: string
    type: string
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
    const navigate = useNavigate()
    const urlParams = useParams<{ coursehash: string; lnmode: string }>()
    const [irData, setIRData] = useState<IRData[]>([])
    const [courseData, setCourseData] = useState<CourseData>()
    const [isLoading, setLoading] = useState(false)

    const columns = useMemo<Tabulator.ColumnDefinition[]>(() => {
        return [
            { formatter: 'rownum', hozAlign: 'center', width: 40, headerSort: false, resizable: false, title: '', responsive: 0 },
            {
                title: 'Name',
                field: 'username',
                resizable: false,
                minWidth: 100,
                responsive: 0,
                headerSort: false,
                cellClick: (e: UIEvent, cell: Tabulator.CellComponent) => {
                    const data = cell.getRow().getData()
                    const userId = data.userid
                    navigate(`/viewer/user/${userId}`)
                },
                tooltip: 'go to user page.',
            },
            {
                title: 'Score',
                field: 'score',
                minWidth: 100,
                responsive: 0,
                resizable: false,
                hozAlign: 'left',
                formatter: 'progress',
                formatterParams: { min: 0, max: (irData[0]?.notes ?? 0) * 2, legend: true },
                headerSort: false,
                cellClick: (e: any, cell: any) => {
                    // const data = cell.getRow().getData()
                    // self.$router.push(`/viewer/song/${self.getSongHash()}/${self.getLnMode()}/score/${data.userid}`)
                },
                tooltip: 'go to score page.',
            },
            {
                title: 'Combo',
                field: 'combo',
                minWidth: 150,
                responsive: 1,
                resizable: false,
                hozAlign: 'left',
                formatter: 'progress',
                formatterParams: {
                    min: 0,
                    max: irData[0]?.notes ?? 0,
                    color: 'orange',
                    legend: true,
                },
                headerSort: false,
            },
            {
                title: 'Clear',
                field: 'clear',
                hozAlign: 'center',
                width: 100,
                responsive: 2,
                resizable: false,
                headerSort: false,
                formatter: (cell: Tabulator.CellComponent) => {
                    switch (cell.getValue()) {
                        case 0:
                            cell.getElement().style.backgroundColor = 'rgb(255, 255, 255)'
                            return 'NoPlay'
                        case 1:
                            cell.getElement().style.backgroundColor = 'rgb(192, 192, 192)'
                            return 'Failed'
                        case 2:
                            cell.getElement().style.backgroundColor = 'rgb(149, 149, 255)'
                            return 'AssistEasy'
                        case 3:
                            cell.getElement().style.backgroundColor = 'rgb(149, 149, 255)'
                            return 'LightAssistEasy'
                        case 4:
                            cell.getElement().style.backgroundColor = 'rgb(152, 251, 152)'
                            return 'Easy'
                        case 5:
                            cell.getElement().style.backgroundColor = 'rgb(152, 251, 152)'
                            return 'Normal'
                        case 6:
                            cell.getElement().style.backgroundColor = 'rgb(255, 99, 71)'
                            return 'Hard'
                        case 7:
                            cell.getElement().style.backgroundColor = 'rgb(255, 217, 0)'
                            return 'ExHard'
                        case 8:
                            cell.getElement().style.backgroundColor = 'rgb(255, 140, 0)'
                            return 'FullCombo'
                        case 9:
                            cell.getElement().style.backgroundColor = 'rgb(255, 140, 0)'
                            return 'Perfect'
                        case 10:
                            cell.getElement().style.backgroundColor = 'rgb(255, 140, 0)'
                            return 'Max'
                        default:
                            return ''
                    }
                },
            },
        ]
    }, [courseData])

    useEffect(() => {
        setLoading(true)
        setIRData([])
        setCourseData(undefined)
        getCourseData()
    }, [urlParams.coursehash, urlParams.lnmode])

    const getCourseData = () => {
        const ks = getAccessKeyAndSecret('get_cource_data').split(',')
        AWS.config.update({
            accessKeyId: ks[0],
            secretAccessKey: ks[1],
        })
        const lambda = new Lambda()
        const params = {
            FunctionName: 'get_cource_data',
            Payload: JSON.stringify({
                songhash: (urlParams.coursehash ?? '') + (urlParams.lnmode ? `.${urlParams.lnmode}` : '.0'),
            }),
        }

        lambda.invoke(params, function (err, data) {
            if (err) {
            } else {
                var json = JSON.parse(data.Payload?.toString() ?? '')
                if (json.message == 'success') {
                    setIRData(json.IRDatas)
                    setCourseData(json.CourceData)
                } else {
                }
            }
            setLoading(false)
        })
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
        return `[MinIR CoursePage]%0D%0A${truncate(title, {
            length: 120,
        })}`
    }
    const socialUrl = (hash: string, lnmode?: string) => {
        return `https://www.gaftalk.com/minir/%23/viewer/course/${hash}${lnmode ? '/' + lnmode : ''}`
    }
    const socialTwitter = useMemo(() => {
        return () => {
            openInNewTab(
                `https://twitter.com/intent/tweet?text=${socialText(courseData?.name ?? '')}%0D%0A${socialUrl(
                    urlParams.coursehash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [courseData])
    const socialFacebook = useMemo(() => {
        return () => {
            openInNewTab(
                `https://www.facebook.com/sharer.php?quote=${socialText(courseData?.name ?? '')}&u=${socialUrl(
                    urlParams.coursehash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [courseData])

    const socialLine = useMemo(() => {
        return () => {
            openInNewTab(
                `https://social-plugins.line.me/lineit/share?text=${socialText(courseData?.name ?? '')}&url=${socialUrl(
                    urlParams.coursehash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [courseData])

    const routeLNModeUrl = (hash: string, lnmode: string) => {
        return `/viewer/course/${hash}/${lnmode}`
    }
    const routeLN = () => {
        navigate(routeLNModeUrl(urlParams.coursehash ?? '', '0'))
    }
    const routeCN = () => {
        navigate(routeLNModeUrl(urlParams.coursehash ?? '', '1'))
    }
    const routeHCN = () => {
        navigate(routeLNModeUrl(urlParams.coursehash ?? '', '2'))
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>{courseData?.name ?? 'MinIR'}</title>
            </Helmet>
            <Box padding={4}>
                {isLoading && <Progress size="xs" isIndeterminate />}
                <TableContainer>
                    <Table size="sm">
                        <Tbody>
                            <Tr>
                                <Td>NAME</Td>
                                <Td>{courseData?.name}</Td>
                            </Tr>
                            <Tr>
                                <Td>ALLOW</Td>
                                <Td>
                                    <HStack spacing={2}>
                                        {courseData?.constraints.map((c, index) => (
                                            <Tag key={index}>{c}</Tag>
                                        ))}
                                    </HStack>
                                </Td>
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
                            <Tr>
                                <Td>LNMODE</Td>
                                <Td>
                                    <ButtonGroup size="xs" isAttached variant="outline">
                                        <Button
                                            mr={'-px'}
                                            colorScheme={'teal'}
                                            variant={!urlParams.lnmode || urlParams.lnmode === '0' ? 'solid' : 'outline'}
                                            onClick={() => routeLN()}>
                                            LN or #LNMODE
                                        </Button>
                                        <Button
                                            mr={'-px'}
                                            colorScheme={'teal'}
                                            variant={urlParams.lnmode === '1' ? 'solid' : 'outline'}
                                            onClick={() => routeCN()}>
                                            CN
                                        </Button>
                                        <Button
                                            colorScheme={'teal'}
                                            variant={urlParams.lnmode === '2' ? 'solid' : 'outline'}
                                            onClick={() => routeHCN()}>
                                            HCN
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
                                        Course Songs
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
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {(JSON.parse(courseData?.songs ?? '[]') as SongData[]).map((s, index) => (
                                                <Tr>
                                                    <Td>{index + 1}</Td>
                                                    <Td>
                                                        <Link as={ReactLink} to={`/viewer/song/${s.songhash}/0`}>
                                                            <ExternalLinkIcon />
                                                        </Link>
                                                    </Td>
                                                    <Td>{s?.title}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
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
