import {
    Box,
    Link,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Heading,
    Progress,
    Text,
    Tag,
    Flex,
    Container,
    Input,
    Textarea,
    InputGroup,
    IconButton,
    InputRightElement,
    Select,
    useToast,
    SimpleGrid,
    Button,
    Badge,
    Spacer,
} from '@chakra-ui/react'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { Buffer } from 'buffer'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { useEffect, useRef, useState } from 'react'
import { Link as ReactLink, useNavigate } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { AddIcon, ArrowUpIcon, CopyIcon, DeleteIcon, ExternalLinkIcon, SearchIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { Auth } from 'aws-amplify'
import jssha from 'jssha'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { cloneDeep } from 'lodash'
dayjs.extend(utc)
dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)

type SongList = {
    title: string
    sha256: string
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

const LNMODE = [
    { label: 'LN or #LNMODE', value: 0 },
    { label: 'CN', value: 1 },
    { label: 'HCN', value: 2 },
]

export default () => {
    const navigate = useNavigate()
    const [tableData, setTableData] = useState<SongList[]>([])
    const [isLoading, setLoading] = useState(false)
    const [isSongLoading, setSongLoading] = useState(false)
    const [isSubmittedLoading, setSubmittedLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        setTableData([])
    }, [])

    const getLatestData = async () => {
        const { data } = await axios.get(
            `https://jdfts1v0wmdeklb-bms.adb.us-ashburn-1.oraclecloudapps.com/ords/bmsquery/bms_text/de6bd8b08c60?text=${searchText}`,
            {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            },
        )

        return data ? data.items : []
    }

    const search = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setLoading(true)
        !(async () => {
            try {
                const data = await getLatestData()
                setTableData(data)
                if (!data.length) {
                    toast({
                        description: 'No search result.',
                        status: 'info',
                        duration: 1500,
                    })
                }
            } catch (error) {
                toast({
                    description: 'Failed to search.',
                    status: 'error',
                    duration: 1500,
                })
            } finally {
                setLoading(false)
            }
        })()
    }

    const [contestName, setContestName] = useState<string>()
    const [description, setDescription] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [startDateTime, setStartDateTime] = useState<Date>()
    const [endDateTime, setEndDateTime] = useState<Date>()
    const [items, setItems] = useState<SongData[]>([])
    const [searchText, setSearchText] = useState<string>()
    const [sha256, setSha256] = useState<string>()
    const [selectLnMode, setSelectLnMode] = useState<string>('0')

    const handleContestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        setContestName(inputValue)
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputValue = e.target.value
        setDescription(inputValue)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        setPassword(inputValue)
    }

    const handleStartDateTimeChange = (date: Date) => {
        setStartDateTime(date)
    }

    const handleEndDateTimeChange = (date: Date) => {
        setEndDateTime(date)
    }

    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        setSearchText(inputValue)
    }

    const handleSha256Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        setSha256(inputValue)
    }

    const handleSelectLnModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const inputValue = e.target.value
        setSelectLnMode(inputValue)
    }

    const addSong = async () => {
        setSongLoading(true)
        const songhash = sha256
        const lnmode = Number(selectLnMode)

        const songItem = items.find((element) => {
            return element.songhash && element.songhash == songhash && element.lnmode == lnmode
        })

        if (songItem) {
            setSongLoading(false)
            return
        }

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
                    songhash: songhash + '.' + selectLnMode,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))

            if (!json.message) {
                throw new Error('Song not found')
            }

            json.SongData.lnmode = lnmode
            const _items = cloneDeep(items)
            _items.push(json.SongData)
            setItems(_items)
            setSha256('')
        } catch (e) {
            console.error(e)
            toast({
                description: 'Failed to create contest.',
                status: 'error',
                duration: 1500,
            })
        } finally {
            setSongLoading(false)
        }
    }

    const removeSong = (index: number) => {
        const _items = cloneDeep(items)
        _items.splice(index, 1)
        setItems(_items)
    }

    const submit = async () => {
        setSubmittedLoading(true)

        const data = await Auth.currentAuthenticatedUser()
        const userData = {
            AccessToken: data.signInUserSession.accessToken.jwtToken,
            RefreshToken: data.signInUserSession.refreshToken.token,
            UserId: data.signInUserSession.idToken.payload.sub,
        }

        let _password = password
        if (!!_password) {
            const shaObj = new jssha('SHA-512', 'TEXT')
            shaObj.update(_password)
            _password = shaObj.getHash('HEX')
        }

        const _startDateTime = dayjs(startDateTime, 'YYYY/MM/DD HH:mm:ssZZ')
        const _endDateTime = dayjs(endDateTime, 'YYYY/MM/DD HH:mm:ssZZ')
        const songs = []
        for (let item of items) {
            if (!item.songhash) {
                continue
            }
            songs.push(item.songhash + '.' + item.lnmode)
        }

        const ks = getAccessKeyAndSecret('create_contest').split(',')
        const client = new LambdaClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: ks[0],
                secretAccessKey: ks[1],
            },
        })
        const params = {
            FunctionName: 'create_contest',
            Payload: Buffer.from(
                JSON.stringify({
                    AccessToken: userData.AccessToken,
                    RefreshToken: userData.RefreshToken,
                    contestName: contestName,
                    description: description ? description : null,
                    password: _password ? _password : null,
                    startDateTime: _startDateTime,
                    endDateTime: _endDateTime,
                    songs: songs,
                }),
            ),
        }

        try {
            const command = new InvokeCommand(params)
            const data = await client.send(command)
            const json = JSON.parse(new TextDecoder().decode(data.Payload))
            navigate(`/viewer/contest/${json.contestId}`)
        } catch (e) {
            console.error(e)
            toast({
                description: 'Failed to create contest.',
                status: 'error',
                duration: 1500,
            })
        } finally {
            setSubmittedLoading(false)
        }
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>Create Contest</title>
            </Helmet>
            <Box padding={4}>
                <Flex flexDirection={'column'}>
                    <Box m={1}>
                        <Input placeholder="Contest name" value={contestName} onChange={handleContestNameChange}></Input>
                    </Box>
                    <Box m={1}>
                        <Textarea
                            placeholder="Description (Optional)"
                            value={description}
                            onChange={handleDescriptionChange}></Textarea>
                    </Box>
                    <Box m={1}>
                        <Input placeholder="Contest password (Optional)" value={password} onChange={handlePasswordChange}></Input>
                    </Box>
                    <SimpleGrid m={1} columns={{ base: 1, md: 2 }} spacing={2}>
                        <Box>
                            <Input
                                as={DatePicker}
                                selected={startDateTime}
                                /*
                                // @ts-ignore */
                                onChange={handleStartDateTimeChange}
                                showTimeSelect
                                dateFormat="Pp"
                                isClearable
                                placeholderText="Start Datetime (Optional)"
                            />
                        </Box>
                        <Box>
                            <Input
                                as={DatePicker}
                                selected={endDateTime}
                                /*
                                // @ts-ignore */
                                onChange={handleEndDateTimeChange}
                                showTimeSelect
                                dateFormat="Pp"
                                isClearable
                                placeholderText="End Datetime (Optional)"
                            />
                        </Box>
                    </SimpleGrid>
                    <Box m={1}>
                        <InputGroup variant={'outline'}>
                            <Input pr="11rem" placeholder={'sha256'} value={sha256} onChange={handleSha256Change} />
                            <InputRightElement width="11rem">
                                <Select value={selectLnMode} size={'xs'} mr={2} onChange={handleSelectLnModeChange}>
                                    {LNMODE.map((l) => (
                                        <option value={l.value}>{l.label}</option>
                                    ))}
                                </Select>
                                <IconButton aria-label="Add song" icon={<AddIcon />} size={'xs'} mr={2} onClick={addSong} />
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                    <Box m={1} shadow={'md'}>
                        {isSongLoading && <Progress size="xs" isIndeterminate />}
                        {items.map((i, index) => (
                            <Flex m={2} borderWidth={1} rounded={'md'}>
                                <Badge>{index + 1}</Badge>
                                <Box>
                                    <Text fontWeight="bold">{i.title}</Text>
                                    <Text fontSize="sm">{LNMODE[i.lnmode!].label}</Text>
                                </Box>
                                <Spacer />
                                <IconButton
                                    aria-label="Remove song"
                                    icon={<DeleteIcon />}
                                    size={'xs'}
                                    mt={'auto'}
                                    colorScheme={'red'}
                                    isLoading={isSongLoading}
                                    onClick={() => removeSong(index)}
                                />
                            </Flex>
                        ))}
                    </Box>
                    <Box m={1}>
                        <Button
                            w={'full'}
                            disabled={!contestName || !items.length}
                            isLoading={isSubmittedLoading}
                            colorScheme={'teal'}
                            onClick={() => submit()}>
                            CREATE CONTEST
                        </Button>
                    </Box>
                    <Box m={1} shadow={'md'}>
                        <Flex p={4} alignItems={'center'} flexDirection={'column'}>
                            <InputGroup size="md" width={{ base: '100%' }}>
                                <Input
                                    value={searchText}
                                    placeholder={'Search text (Need 3 characters)'}
                                    variant="outline"
                                    pr="4.5rem"
                                    onChange={handleSearchTextChange}
                                />
                                <InputRightElement width="4.5rem">
                                    <IconButton
                                        aria-label="search"
                                        icon={<SearchIcon />}
                                        size={'sm'}
                                        onClick={search}
                                        disabled={!searchText || searchText.length < 3}
                                        isLoading={isLoading}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </Flex>
                        {isLoading && <Progress size="xs" isIndeterminate />}
                        <TableContainer>
                            <Table variant="striped" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>TITLE</Th>
                                        <Th display={{ base: 'none', md: 'table-cell' }}>SHA256</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {tableData.map((d, index) => (
                                        <Tr key={index}>
                                            <Td>
                                                <Text isTruncated>{d.title}</Text>
                                            </Td>
                                            <Td display={{ base: 'none', md: 'table-cell' }}>
                                                <Text>{d.sha256}</Text>
                                            </Td>
                                            <Td>
                                                <Button
                                                    rightIcon={<ArrowUpIcon />}
                                                    colorScheme="teal"
                                                    variant="outline"
                                                    size={'xs'}
                                                    onClick={() => setSha256(d.sha256)}>
                                                    Set to SHA256 field
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Flex>
            </Box>
        </DefaultLayout>
    )
}
