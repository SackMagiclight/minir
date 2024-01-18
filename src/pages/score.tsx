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
import { useMemo } from 'react'
import { DefaultLayout } from '~/layout/Default'
import { FaFacebook, FaLine, FaTwitter } from 'react-icons/fa'
import { truncate } from 'lodash'
import { Helmet } from 'react-helmet-async'
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts'
import { useGetSongScoreQuery } from '../api'

export default () => {
    const urlParams = useParams<{ songhash: string; lnmode: string; userId: string }>()
    const { data, isLoading } = useGetSongScoreQuery({
        songhash: (urlParams.songhash ?? '') + (urlParams.lnmode ? `.${urlParams.lnmode}` : ''),
        userid: urlParams.userId ?? '',
    }, {
        skip: !urlParams.songhash || !urlParams.userId,
    })

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
                    data?.songData?.title ?? '',
                    data?.IRDatas?.username ?? '',
                    data?.IRDatas?.score ?? 0,
                )}%0D%0A${socialUrl(urlParams.songhash ?? '', urlParams.lnmode ?? '', urlParams.userId ?? '')}`,
            )
        }
    }, [data])
    const socialFacebook = useMemo(() => {
        return () => {
            openInNewTab(
                `https://www.facebook.com/sharer.php?quote=${socialText(
                    data?.songData?.title ?? '',
                    data?.IRDatas?.username ?? '',
                    data?.IRDatas?.score ?? 0,
                )}&u=${socialUrl(urlParams.songhash ?? '', urlParams.lnmode ?? '', urlParams.userId ?? '')}`,
            )
        }
    }, [data])

    const socialLine = useMemo(() => {
        return () => {
            openInNewTab(
                `https://social-plugins.line.me/lineit/share?text=${socialText(
                    data?.songData?.title ?? '',
                    data?.IRDatas?.username ?? '',
                    data?.IRDatas?.score ?? 0,
                )}&url=${socialUrl(urlParams.songhash ?? '', urlParams.lnmode ?? '', urlParams.userId ?? '')}`,
            )
        }
    }, [data])

    const score = useMemo(() => {
        return data?.IRDatas?.score ?? 0
    }, [data])

    const clearElement = useMemo(() => {
        let backgroundColor = ''
        let text = ''
        switch (data?.IRDatas?.clear) {
            case 0:
                backgroundColor = 'rgb(255, 255, 255)'
                text = 'NoPlay'
                break
            case 1:
                backgroundColor = 'rgb(192, 192, 192)'
                text = 'Failed'
                break
            case 2:
                backgroundColor = 'rgb(149, 149, 255)'
                text = 'AssistEasy'
                break
            case 3:
                backgroundColor = 'rgb(149, 149, 255)'
                text = 'LightAssistEasy'
                break
            case 4:
                backgroundColor = 'rgb(152, 251, 152)'
                text = 'Easy'
                break
            case 5:
                backgroundColor = 'rgb(152, 251, 152)'
                text = 'Normal'
                break
            case 6:
                backgroundColor = 'rgb(255, 99, 71)'
                return 'Hard'
                break
            case 7:
                backgroundColor = 'rgb(255, 217, 0)'
                text = 'ExHard'
                break
            case 8:
                backgroundColor = 'rgb(255, 140, 0)'
                text = 'FullCombo'
                break
            case 9:
                backgroundColor = 'rgb(255, 140, 0)'
                text = 'Perfect'
                break
            case 10:
                backgroundColor = 'rgb(255, 140, 0)'
                text = 'Max'
                break
            default:
                backgroundColor = ''
                text = ''
        }
        return <Badge backgroundColor={backgroundColor}>{text}</Badge>
    }, [data])

    const maxScore = useMemo(() => {
        return (data?.songData?.notes ?? 0) * 2
    }, [data])

    const rate = useMemo(() => {
        return (Math.floor((score / maxScore) * 10000) * 100) / 10000
    }, [score, maxScore])

    const earlyLate = useMemo(() => {
        return [
            { name: 'PGREAT', value: data?.IRDatas?.epg ?? 0, color: '#0088FE' },
            { name: 'GREAT', value: data?.IRDatas?.egr ?? 0, color: '#0088FE' },
            { name: 'PGREAT', value: data?.IRDatas?.lpg ?? 0, color: '#FF8042' },
            { name: 'GREAT', value: data?.IRDatas?.lgr ?? 0, color: '#FF8042' },
        ]
    }, [data])

    const earlyLate2 = useMemo(() => {
        return [
            { name: 'EARLY', value: (data?.IRDatas?.epg ?? 0) + (data?.IRDatas?.egr ?? 0), color: '#0088FE' },
            { name: 'LATE', value: (data?.IRDatas?.lpg ?? 0) + (data?.IRDatas?.lgr ?? 0), color: '#FF8042' },
        ]
    }, [data])

    const judgeMap = useMemo(() => {
        return [
            { name: 'PGREAT', value: (data?.IRDatas?.epg ?? 0) + (data?.IRDatas?.lpg ?? 0), color: '#0088FE' },
            { name: 'GREAT', value: (data?.IRDatas?.egr ?? 0) + (data?.IRDatas?.lgr ?? 0), color: '#00C49F' },
            {
                name: '',
                value:
                    (data?.songData?.notes ?? 0) - ((data?.IRDatas?.epg ?? 0) + (data?.IRDatas?.lpg ?? 0) + (data?.IRDatas?.egr ?? 0) + (data?.IRDatas?.lgr ?? 0)),
                color: '#FF8042',
            },
        ]
    }, [data])

    return (
        <DefaultLayout>
            <Helmet>
                <title>{`${data?.songData?.title ?? 'MinIR'} - ${data?.IRDatas?.username ?? ''} `}</title>
            </Helmet>
            <Box padding={4}>
                {isLoading && <Progress size="xs" isIndeterminate />}
                <TableContainer>
                    <Table size="sm">
                        <Tbody>
                            <Tr>
                                <Td>TITLE</Td>
                                <Td>{data?.songData?.title}</Td>
                            </Tr>
                            <Tr>
                                <Td>USER NAME</Td>
                                <Td>{data?.IRDatas?.username}</Td>
                            </Tr>
                            <Tr>
                                <Td>CLEAR</Td>
                                <Td>{clearElement}</Td>
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
