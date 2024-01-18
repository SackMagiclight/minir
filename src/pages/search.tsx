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
    Progress,
    Text,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    useToast,
    Divider,
    Flex,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { ExternalLinkIcon, SearchIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'

type SongList = {
    title: string
    sha256: string
}

export default () => {
    const [tableData, setTableData] = useState<SongList[]>([])
    const [isLoading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const toast = useToast()

    useEffect(() => {
        setTableData([])
    }, [])

    const changeSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const getLatestData = async () => {
        const { data } = await axios.get(
            `https://jdfts1v0wmdeklb-songs.adb.us-ashburn-1.oraclecloudapps.com/ords/bmsquery/bms_text/de6bd8b08c60?text=${searchText}`,
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

    return (
        <DefaultLayout>
            <Helmet>
                <title>Search BMS</title>
            </Helmet>
            <Box padding={4}>
                <Flex mb={4} alignItems={'center'} flexDirection={'column'} >
                    <InputGroup size="md" width={{base: '100%', md: '60%'}}>
                        <Input
                            value={searchText}
                            onChange={changeSearchText}
                            placeholder={'Search text (Need 3 characters)'}
                            variant="outline"
                            pr="4.5rem"
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
                <Divider></Divider>
                {isLoading && <Progress size="xs" isIndeterminate />}
                {!isLoading && !!tableData.length && (
                    <TableContainer>
                        <Table variant="striped" size="sm">
                            <Thead>
                                <Tr>
                                    <Th w={'32px'}>IR</Th>
                                    <Th maxW={'95vw'}>TITLE</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {tableData.map((d, index) => (
                                    <Tr key={index}>
                                        <Td>
                                            <Link as={ReactLink} to={`/viewer/song/${d.sha256}/0`} target={'_blank'} >
                                                <ExternalLinkIcon />
                                            </Link>
                                        </Td>
                                        <Td maxW={'95vw'}>
                                            <Text isTruncated>{d.title}</Text>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </DefaultLayout>
    )
}
