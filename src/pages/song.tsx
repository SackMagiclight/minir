import {
    Box,
    Table,
    TableContainer,
    Tbody,
    Td,
    Tr,
    Progress,
    Button,
    Input,
    IconButton,
    InputGroup,
    InputRightElement,
    useToast,
    ButtonGroup,
    Link,
    Flex,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { DefaultLayout } from '~/layout/Default'

import { ReactTabulator } from 'react-tabulator'
import { Tabulator } from 'react-tabulator/lib/types/TabulatorTypes'
import 'react-tabulator/lib/styles.css'
import 'react-tabulator/lib/css/tabulator_semanticui.min.css'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { FaFacebook, FaLine, FaTwitter } from 'react-icons/fa'
import { useQuery } from 'react-query'
import axios from 'axios'
import { cloneDeep, truncate } from 'lodash'
import { Helmet } from 'react-helmet-async'
import { useGetSongScoreListQuery } from '../api'
import { useSelector } from 'react-redux'
import { getUserId } from '../store/userStore'
import numeral from 'numeral'
import { Link as ReactLink } from 'react-router-dom'

const getClear = (clear: number) => {
    let backgroundColor = "inherit"
    let text = ""
    switch (clear) {
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
             backgroundColor = 'rgb(60, 179, 113)'
            text =  'Normal'
            break
        case 6:
             backgroundColor = 'rgb(255, 99, 71)'
            text =  'Hard'
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
            break
    }

    return {
        backgroundColor,
        text
    }
}

export default () => {
    const navigate = useNavigate()
    const urlParams = useParams<{ songhash: string; lnmode: string }>()
    const toast = useToast()
    const loginUserId = useSelector(getUserId)

    const { data, isLoading } = useGetSongScoreListQuery({
        songhash: `${urlParams.songhash ?? ''}${urlParams.lnmode ? `.${urlParams.lnmode}` : '.0'}`,
    })

    const columns = useMemo<Tabulator.ColumnDefinition[]>(() => {
        return [
            {
                hozAlign: 'center',
                width: 80,
                headerSort: false,
                resizable: false,
                title: '',
                responsive: 0,
                formatter: (cell: Tabulator.CellComponent) => {
                    const tbl = cell.getTable()
                    const page = tbl.getPage()
                    if (page === false) {
                        return '-'
                    }
                    const pageSize = tbl.getPageSize()
                    let num = (page - 1) * pageSize
                    num += cell.getRow().getPosition(true)

                    return String(num)
                },
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
                formatterParams: { min: 0, max: (data?.songData?.notes ?? 0) * 2, legend: true },
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
                    max: data?.songData?.notes ?? 0,
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
                    const { backgroundColor, text } = getClear(cell.getValue())
                    cell.getElement().style.backgroundColor = backgroundColor
                    return text
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
                    cell.getElement().style.fontSize = '10px'
                    return `${data.beatorajaVer ?? ''} <br/> ${data.skinName ?? ''}`
                },
                headerSort: false,
            },
        ]
    }, [data])

    const { data: stellaUrl } = useQuery(
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
                `https://twitter.com/intent/tweet?text=${socialText(data?.songData?.title ?? '')}%0D%0A${socialUrl(
                    urlParams.songhash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [data])
    const socialFacebook = useMemo(() => {
        return () => {
            openInNewTab(
                `https://www.facebook.com/sharer.php?quote=${socialText(data?.songData?.title ?? '')}&u=${socialUrl(
                    urlParams.songhash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [data])

    const socialLine = useMemo(() => {
        return () => {
            openInNewTab(
                `https://social-plugins.line.me/lineit/share?text=${socialText(data?.songData?.title ?? '')}&url=${socialUrl(
                    urlParams.songhash ?? '',
                    urlParams.lnmode,
                )}`,
            )
        }
    }, [data])

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

    const irData = useMemo(() => {
        return cloneDeep(data?.IRDatas)
    }, [data])

    const userScoreData = useMemo(() => {
        if (!data) {
            return {
                rowNum: 0,
                scoreData: undefined,
            }
        }
        const userScore = data.IRDatas.find((v) => v.userid === loginUserId)
        if (userScore) {
            return {
                rowNum: data.IRDatas.findIndex((v) => v.userid === loginUserId) + 1,
                scoreData: userScore,
            }
        } else {
            return {
                rowNum: 0,
                scoreData: undefined,
            }
        }
    }, [data])

    const maxScore = useMemo(() => {
        return (data?.songData?.notes ?? 0) * 2
    }, [data])

    return (
        <DefaultLayout>
            <Helmet>
                <title>{data?.songData?.title ?? 'MinIR'}</title>
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
                                <Td>{data?.songData?.title}</Td>
                            </Tr>
                            <Tr>
                                <Td>ARTIST</Td>
                                <Td>{data?.songData?.artist}</Td>
                            </Tr>
                            <Tr>
                                <Td>INFO</Td>
                                <Td>
                                    ☆{data?.songData?.level} / {data?.songData?.notes}notes / {data?.songData?.total}total
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>LINKS</Td>
                                <Td>
                                    <ButtonGroup variant="outline" spacing="2">
                                        {stellaUrl && (
                                            <Button color={'#001529'} size="xs" as={Link} href={`https://stellabms.xyz/sha256/${urlParams.songhash}`} isExternal>
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
                                            variant={!data?.songData?.lnmode && urlParams.lnmode === '1' ? 'solid' : 'outline'}
                                            onClick={() => routeCN()}>
                                            CN
                                        </Button>
                                        <Button
                                            colorScheme={'teal'}
                                            variant={!data?.songData?.lnmode && urlParams.lnmode === '2' ? 'solid' : 'outline'}
                                            onClick={() => routeHCN()}>
                                            HCN
                                        </Button>
                                    </ButtonGroup>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
                {!isLoading && loginUserId && (
                    <Flex
                        justifyContent={'center'}
                        flexDirection={'column'}
                        paddingX={4}
                        paddingY={1}
                        borderLeftWidth={4}
                        marginY={2}
                        marginX={4}
                        gap={2}>
                        <Box fontSize={'large'}>USER DATA</Box>
                        <Box>
                            {userScoreData.scoreData ? (
                                <Box>
                                    <Flex gap={2} alignItems={'flex-end'}>
                                        <Box>
                                            <Box fontSize={'small'}>PLACE</Box>
                                            <Flex
                                                fontSize={'x-large'}
                                                fontWeight={'Bold'}
                                                borderBottomWidth={2}
                                                borderBottomColor={'gray'}
                                                paddingBottom={0.5}
                                                marginBottom={1}
                                                alignItems={'baseline'}>
                                                <Box>{numeral(userScoreData.rowNum).format('0o')}</Box>
                                                <Box fontSize={'small'}>/{numeral(irData?.length ?? 0).format('0o')}</Box>
                                            </Flex>
                                        </Box>
                                        <Box>
                                            <Box fontSize={'small'}>SCORE</Box>
                                            <Flex fontSize={'x-large'} backgroundColor={'#06c755'} paddingX={4} marginBottom={2} alignItems={'baseline'}>
                                                <Box>{userScoreData.scoreData.score}</Box>
                                                <Box fontSize={'small'}>/{maxScore}</Box>
                                            </Flex>
                                        </Box>
                                        <Box>
                                            <Box fontSize={'small'}>COMBO</Box>
                                            <Flex fontSize={'x-large'} backgroundColor={"orange"} paddingX={4} marginBottom={2} alignItems={'baseline'}>
                                                <Box>{userScoreData.scoreData.combo}</Box>
                                                <Box fontSize={'small'}>/{data?.songData?.notes ?? 0}</Box>
                                            </Flex>
                                        </Box>
                                        <Box>
                                            <Box fontSize={'small'}>CLEAR</Box>
                                            <Box fontSize={'x-large'} backgroundColor={getClear(userScoreData.scoreData.clear).backgroundColor} paddingX={4} marginBottom={2}>
                                                {getClear(userScoreData.scoreData.clear).text}
                                            </Box>
                                        </Box>
                                        <Flex>
                                            <Link
                                                as={ReactLink}
                                                 marginBottom={2}
                                                to={`/viewer/${
                                                    userScoreData.scoreData.songhash.split('.')[0].length == 67
                                                        ? 'course'
                                                        : 'song'
                                                }/${userScoreData.scoreData.songhash.split('.')[0]}/${
                                                    userScoreData.scoreData.songhash.split('.')[1]
                                                }/score/${userScoreData.scoreData.userid}`}>
                                                <ExternalLinkIcon fontSize={24} />
                                            </Link>
                                        </Flex>
                                    </Flex>
                                </Box>
                            ) : (
                                <Box fontSize={'small'}>NO SCORE</Box>
                            )}
                        </Box>
                    </Flex>
                )}
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
