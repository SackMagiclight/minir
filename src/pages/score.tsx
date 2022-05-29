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
    SimpleGrid,
    Heading,
    Badge,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import Lambda from 'aws-sdk/clients/lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import AWS from 'aws-sdk'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'
import { FaFacebook, FaLine, FaTwitter } from 'react-icons/fa'
import { truncate } from 'lodash'
import { Helmet } from 'react-helmet-async'
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts'

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

export default () => {
    const urlParams = useParams<{ songhash: string; lnmode: string; userId: string }>()
    const [irData, setIRData] = useState<IRData>()
    const [songData, setSongData] = useState<SongData>()
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setIRData(undefined)
        setSongData(undefined)
        getSongData()
    }, [urlParams.songhash, urlParams.lnmode])

    const getSongData = () => {
        const ks = getAccessKeyAndSecret('get_song_data').split(',')
        AWS.config.update({
            accessKeyId: ks[0],
            secretAccessKey: ks[1],
        })
        const lambda = new Lambda()
        const params = {
            FunctionName: 'get_song_data',
            Payload: JSON.stringify({
                songhash: (urlParams.songhash ?? '') + (urlParams.lnmode ? `.${urlParams.lnmode}` : '.0'),
                userid: urlParams.userId,
            }),
        }

        lambda.invoke(params, function (err, data) {
            if (err) {
            } else {
                var json = JSON.parse(data.Payload?.toString() ?? '')
                if (json.message == 'success') {
                    setIRData(json.IRDatas[0])
                    setSongData(json.SongData)
                } else {
                }
            }
            setLoading(false)
        })
    }

    const openInNewTab = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const socialText = (title: string, userName: string, score: number) => {
        return `[MinIR ScorePage]${truncate(title, {
            length: 60,
        })}%0D%0A%0D%0AScore:${score}%0D%0APlayer:${truncate(userName, {
            length: 40,
        })}`
    }
    const socialUrl = (hash: string, lnmode: string, userId: string) => {
        return `https://www.gaftalk.com/minir/%23/viewer/song/${hash}${lnmode ? '/' + lnmode : ''}/score/${userId}`
    }
    const socialTwitter = useMemo(() => {
        return () => {
            openInNewTab(
                `https://twitter.com/intent/tweet?text=${socialText(
                    songData?.title ?? '',
                    irData?.username ?? '',
                    irData?.score ?? 0,
                )}%0D%0A${socialUrl(urlParams.songhash ?? '', urlParams.lnmode ?? '', urlParams.userId ?? '')}`,
            )
        }
    }, [songData])
    const socialFacebook = useMemo(() => {
        return () => {
            openInNewTab(
                `https://www.facebook.com/sharer.php?quote=${socialText(
                    songData?.title ?? '',
                    irData?.username ?? '',
                    irData?.score ?? 0,
                )}&u=${socialUrl(urlParams.songhash ?? '', urlParams.lnmode ?? '', urlParams.userId ?? '')}`,
            )
        }
    }, [songData])

    const socialLine = useMemo(() => {
        return () => {
            openInNewTab(
                `https://social-plugins.line.me/lineit/share?text=${socialText(
                    songData?.title ?? '',
                    irData?.username ?? '',
                    irData?.score ?? 0,
                )}&url=${socialUrl(urlParams.songhash ?? '', urlParams.lnmode ?? '', urlParams.userId ?? '')}`,
            )
        }
    }, [songData])

    const score = useMemo(() => {
        return irData?.score ?? 0
    }, [irData])

    const clearElement = useMemo(() => {
        let backgroundColor = ''
        let text = ''
        switch (irData?.clear) {
            case 0:
                backgroundColor = 'rgb(255, 255, 255)'
                text = 'NoPlay'
                break
            case 1:
                backgroundColor = 'rgb(192, 192, 192)'
                text =  'Failed'
                break
            case 2:
                backgroundColor = 'rgb(149, 149, 255)'
                text =  'AssistEasy'
                break
            case 3:
                backgroundColor = 'rgb(149, 149, 255)'
                text =  'LightAssistEasy'
                break
            case 4:
                backgroundColor = 'rgb(152, 251, 152)'
                text =  'Easy'
                break
            case 5:
                backgroundColor = 'rgb(152, 251, 152)'
                text =  'Normal'
                break
            case 6:
                backgroundColor = 'rgb(255, 99, 71)'
                return 'Hard'
                break
            case 7:
                backgroundColor = 'rgb(255, 217, 0)'
                text =  'ExHard'
                break
            case 8:
                backgroundColor = 'rgb(255, 140, 0)'
                text =  'FullCombo'
                break
            case 9:
                backgroundColor = 'rgb(255, 140, 0)'
                text =  'Perfect'
                break
            case 10:
                backgroundColor = 'rgb(255, 140, 0)'
                text =  'Max'
                break
            default:
                backgroundColor = ''
                text =  ''
        }
        return (<Badge backgroundColor={backgroundColor}>{text}</Badge>)
    }, [irData])

    const maxScore = useMemo(() => {
        return (songData?.notes ?? 0) * 2
    }, [songData])

    const rate = useMemo(() => {
        return (Math.floor((score / maxScore) * 10000) * 100) / 10000
    }, [score, maxScore])

    const earlyLate = useMemo(() => {
        return [
            { name: 'PGREAT', value: irData?.epg ?? 0, color: '#0088FE' },
            { name: 'GREAT', value: irData?.egr ?? 0, color: '#0088FE' },
            { name: 'PGREAT', value: irData?.lpg ?? 0, color: '#FF8042' },
            { name: 'GREAT', value: irData?.lgr ?? 0, color: '#FF8042' },
        ]
    }, [irData])

    const earlyLate2 = useMemo(() => {
        return [
            { name: 'EARLY', value: (irData?.epg ?? 0) + (irData?.egr ?? 0), color: '#0088FE' },
            { name: 'LATE', value: (irData?.lpg ?? 0) + (irData?.lgr ?? 0), color: '#FF8042' },
        ]
    }, [irData])

    const judgeMap = useMemo(() => {
        return [
            { name: 'PGREAT', value: (irData?.epg ?? 0) + (irData?.lpg ?? 0), color: '#0088FE' },
            { name: 'GREAT', value: (irData?.egr ?? 0) + (irData?.lgr ?? 0), color: '#00C49F' },
            {
                name: '',
                value:
                    (songData?.notes ?? 0) - ((irData?.epg ?? 0) + (irData?.lpg ?? 0) + (irData?.egr ?? 0) + (irData?.lgr ?? 0)),
                color: '#FF8042',
            },
        ]
    }, [irData])

    return (
        <DefaultLayout>
            <Helmet>
                <title>{`${songData?.title ?? 'MinIR'} - ${irData?.username ?? ''} `}</title>
            </Helmet>
            <Box padding={4}>
                {isLoading && <Progress size="xs" isIndeterminate />}
                <TableContainer>
                    <Table size="sm">
                        <Tbody>
                            <Tr>
                                <Td>TITLE</Td>
                                <Td>{songData?.title}</Td>
                            </Tr>
                            <Tr>
                                <Td>USER NAME</Td>
                                <Td>{irData?.username}</Td>
                            </Tr>
                            <Tr>
                                <Td>CLEAR</Td>
                                <Td>
                                    {clearElement}
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>SCORE</Td>
                                <Td>
                                    {score} / {maxScore} ( {rate} % )
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
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
            <Box padding={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacingX="40px" spacingY="20px" justifyItems={'center'}>
                    <Box w={'full'}>
                        <Heading color={'gray.600'} textAlign={'center'}>
                            JUDGE
                        </Heading>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={judgeMap} dataKey="value" nameKey="name" label>
                                    <LabelList dataKey="name" position="inside" />
                                    {judgeMap.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                    <Box w={'full'}>
                        <Heading color={'gray.600'} textAlign={'center'}>
                            EARLY / LATE
                        </Heading>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={earlyLate2} dataKey="value" nameKey="name" outerRadius={40} fill="#8884d8">
                                    <LabelList dataKey="name" position="inside" />
                                    {earlyLate2.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Pie
                                    data={earlyLate}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={120}
                                    label>
                                    <LabelList dataKey="name" position="top" />
                                    {earlyLate.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </SimpleGrid>
            </Box>
        </DefaultLayout>
    )
}
