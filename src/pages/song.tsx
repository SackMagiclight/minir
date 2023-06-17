import {
    Box,
    Table,
    TableContainer,
    Tbody,
    Td,
    Tr,
    Progress,
    useDisclosure,
    Button,
    Input,
    IconButton,
    InputGroup,
    InputRightElement,
    useToast,
    ButtonGroup,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'

import { ReactTabulator } from 'react-tabulator'
import { Tabulator } from 'react-tabulator/lib/types/TabulatorTypes'
import 'react-tabulator/lib/styles.css'
import 'react-tabulator/lib/css/tabulator_semanticui.min.css'
import { CopyIcon } from '@chakra-ui/icons'
import { FaFacebook, FaLine, FaTwitter } from 'react-icons/fa'
import { useQuery } from 'react-query'
import axios from 'axios'
import { truncate } from 'lodash'
import { Helmet } from 'react-helmet-async'
import { Buffer } from 'buffer'

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
    avgjudge: number
    beatorajaVer: string
    skinName: string
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
    const navigate = useNavigate()
    const urlParams = useParams<{ songhash: string; lnmode: string }>()
    const [irData, setIRData] = useState<IRData[]>([])
    const [songData, setSongData] = useState<SongData>()
    const [isLoading, setLoading] = useState(false)
    const toast = useToast()

    const columns = useMemo<Tabulator.ColumnDefinition[]>(() => {
        return [
            {
                formatter: 'rownum',
                hozAlign: 'center',
                width: 80,
                headerSort: false,
                resizable: false,
                title: '',
                responsive: 0,
            },
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
                vertAlign: 'bottom',
                formatter: 'progress',
                formatterParams: { min: 0, max: (songData?.notes ?? 0) * 2, legend: true },
                headerSort: false,
                cellClick: (e: any, cell: any) => {
                    const data = cell.getRow().getData()
                    navigate(`/viewer/song/${urlParams.songhash}/${urlParams.lnmode ?? '0'}/score/${data.userid}`)
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
                vertAlign: 'middle',
                formatter: 'progress',
                formatterParams: {
                    min: 0,
                    max: songData?.notes ?? 0,
                    color: 'orange',
                    legend: true,
                },
                headerSort: false,
            },
            {
                title: 'Duration',
                field: 'avgjudge',
                minWidth: 100,
                maxWidth: 120,
                responsive: 1,
                resizable: false,
                hozAlign: 'left',
                vertAlign: 'middle',
                formatter: (cell: Tabulator.CellComponent) => {
                    return cell.getValue() ? `${cell.getValue() / 1000}ms` : ''
                },
                headerSort: false,
            },
            {
                title: 'Clear',
                field: 'clear',
                hozAlign: 'center',
                vertAlign: 'middle',
                width: 110,
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
            {
                title: 'Env',
                field: 'beatorajaVer',
                minWidth: 100,
                maxWidth: 140,
                responsive: 1,
                resizable: false,
                hozAlign: 'left',
                formatter: (cell: Tabulator.CellComponent) => {
                    const data = cell.getRow().getData()
                    return `${data.beatorajaVer ?? ''} <br/> ${data.skinName ?? ''}`
                },
                headerSort: false,
            },
        ]
    }, [songData])

    const { data: stellaUrl, isLoading: isStellaLoading } = useQuery(
        'posts',
        async () => {
            const { data } = await axios.get(`https://stellabms.xyz/sha256/${urlParams.songhash}`, {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            })
            return data
        },
        { retry: 0 },
    )

    useEffect(() => {
        setLoading(true)
        setIRData([])
        setSongData(undefined)
        getSongData()
    }, [urlParams.songhash, urlParams.lnmode])

    const getSongData = async () => {
        const ks = getAccessKeyAndSecret('get_song_data').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'get_song_data',
            Payload: Buffer.from(
                JSON.stringify({
                    songhash: (urlParams.songhash ?? '') + (urlParams.lnmode ? `.${urlParams.lnmode}` : '.0'),
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            if (json.message == 'success') {
                setIRData(json.IRDatas)
                setSongData(json.SongData)
            } else {
            }
        } catch {
        } finally {
            setLoading(false)
        }
    }

    const rowFormatter = (row: Tabulator.RowComponent) => {
        if (row.getData().novalidate) {
            row.getElement().style.backgroundColor = '#A6A6DF'
        }
    }

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (urlParams.songhash) {
            navigator.clipboard.writeText(urlParams.songhash)
            toast({
                description: 'Copied.',
                status: 'success',
                duration: 1500,
            })
        }
    }

    const openInNewTab = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const socialText = (title: string) => {
        return `[MinIR SongPage]%0D%0A${truncate(title, {
            length: 120,
        })}`
    }
    const socialUrl = (hash: string, lnmode?: string) => {
        return `https://www.gaftalk.com/minir/%23/viewer/song/${hash}${lnmode ? '/' + lnmode : ''}`
    }
    const socialTwitter = useMemo(() => {
        return () => {
            openInNewTab(
                `https://twitter.com/intent/tweet?text=${socialText(songData?.title ?? '')}%0D%0A${socialUrl(
                    urlParams.songhash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [songData])
    const socialFacebook = useMemo(() => {
        return () => {
            openInNewTab(
                `https://www.facebook.com/sharer.php?quote=${socialText(songData?.title ?? '')}&u=${socialUrl(
                    urlParams.songhash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [songData])

    const socialLine = useMemo(() => {
        return () => {
            openInNewTab(
                `https://social-plugins.line.me/lineit/share?text=${socialText(songData?.title ?? '')}&url=${socialUrl(
                    urlParams.songhash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [songData])

    const routeLNModeUrl = (hash: string, lnmode: string) => {
        return `/viewer/song/${hash}/${lnmode}`
    }
    const routeLN = () => {
        navigate(routeLNModeUrl(urlParams.songhash ?? '', '0'))
    }
    const routeCN = () => {
        navigate(routeLNModeUrl(urlParams.songhash ?? '', '1'))
    }
    const routeHCN = () => {
        navigate(routeLNModeUrl(urlParams.songhash ?? '', '2'))
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>{songData?.title ?? 'MinIR'}</title>
            </Helmet>
            <Box padding={4}>
                {isLoading && <Progress size="xs" isIndeterminate />}
                <TableContainer>
                    <Table size="sm">
                        <Tbody>
                            <Tr>
                                <Td>SONG ID</Td>
                                <Td>
                                    <InputGroup size="sm">
                                        <Input value={urlParams.songhash} readOnly variant="flushed" pr="2.5rem" />
                                        <InputRightElement width="2.5rem">
                                            <IconButton
                                                aria-label="copy song id"
                                                icon={<CopyIcon />}
                                                size={'xs'}
                                                onClick={handleCopy}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>TITLE</Td>
                                <Td>{songData?.title}</Td>
                            </Tr>
                            <Tr>
                                <Td>ARTIST</Td>
                                <Td>{songData?.artist}</Td>
                            </Tr>
                            <Tr>
                                <Td>INFO</Td>
                                <Td>
                                    ☆{songData?.level} / {songData?.notes}notes / {songData?.total}total
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>LINKS</Td>
                                <Td>
                                    <ButtonGroup variant="outline" spacing="2">
                                        {stellaUrl && (
                                            <Button color={'#001529'} size="xs" as={'a'} href={stellaUrl} target={'_blank'}>
                                                Stella / Satellite
                                            </Button>
                                        )}
                                        <Button
                                            color={'#FF7066'}
                                            size="xs"
                                            as={'a'}
                                            href={`https://cinnamon.link/charts/${urlParams.songhash}`}
                                            target={'_blank'}>
                                            Cinnamon
                                        </Button>
                                        <Button
                                            color={'#75491E'}
                                            size="xs"
                                            as={'a'}
                                            href={`https://mocha-repository.info/song.php?sha256=${urlParams.songhash}`}
                                            target={'_blank'}>
                                            Mocha-Repository
                                        </Button>
                                    </ButtonGroup>
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
                                            variant={!songData?.lnmode && urlParams.lnmode === '1' ? 'solid' : 'outline'}
                                            onClick={() => routeCN()}>
                                            CN
                                        </Button>
                                        <Button
                                            colorScheme={'teal'}
                                            variant={!songData?.lnmode && urlParams.lnmode === '2' ? 'solid' : 'outline'}
                                            onClick={() => routeHCN()}>
                                            HCN
                                        </Button>
                                    </ButtonGroup>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
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
