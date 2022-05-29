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
} from '@chakra-ui/react'
import Lambda from 'aws-sdk/clients/lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import AWS from 'aws-sdk'
import { useEffect, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
dayjs.extend(utc)
dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)

type ContestList = {
    contestId: string
    contestName: string
    startDateTime: string
    endDateTime: string
}

export default () => {
    const [tableData, setTableData] = useState<ContestList[]>([])
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setTableData([])
        getLatestData()
    }, [])

    const getLatestData = async () => {
        const ks = getAccessKeyAndSecret('get_contests_100').split(',')
        AWS.config.update({
            accessKeyId: ks[0],
            secretAccessKey: ks[1],
        })
        const lambda = new Lambda()
        const params = {
            FunctionName: 'get_contests_100',
        }

        try {
            const data = await lambda.invoke(params).promise()
            const json = JSON.parse(data.Payload?.toString() ?? '')
            if (json.message == 'success') {
                setTableData(json.contestDatas)
            } else {
            }
        } catch {
        } finally {
            setLoading(false)
        }
    }

    const betweenToday = (start: string, end: string) => {
        return dayjs().isBetween(dayjs(start), dayjs(end), 'day', '[]')
    }

    const graterToday = (end: string) => {
        return dayjs().isSameOrAfter(dayjs(end), 'day')
    }

    const getBgColor = (start: string, end: string) => {
        if (betweenToday(start, end)) return 'green.200'
        else if (graterToday(end)) return 'gray.300'
        else return undefined
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>Contest List</title>
            </Helmet>
            <Box padding={4}>
                <Flex mb={4}>
                    <Text mr={2}>
                        <Tag variant="outline" justifyContent={'center'} w={12} mr={2}></Tag>開催前
                    </Text>
                    <Text mr={2}>
                        <Tag
                            variant="outline"
                            justifyContent={'center'}
                            w={12}
                            mr={2}
                            colorScheme={'green.200'}
                            backgroundColor={'green.200'}></Tag>
                        開催中
                    </Text>
                    <Text>
                        <Tag
                            variant="outline"
                            justifyContent={'center'}
                            w={12}
                            mr={2}
                            colorScheme={'gray.300'}
                            backgroundColor={'gray.300'}></Tag>
                        終了済み
                    </Text>
                </Flex>
                {isLoading && <Progress size="xs" isIndeterminate />}
                <TableContainer>
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th w={'32px'}>IR</Th>
                                <Th>TITLE</Th>
                                <Th display={{ base: 'none', md: 'table-cell' }} w={'120px'}>
                                    EVENT DATES
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {tableData.map((d, index) => (
                                <Tr key={index} backgroundColor={getBgColor(d.startDateTime, d.endDateTime)}>
                                    <Td>
                                        <Link as={ReactLink} to={`/viewer/contest/${d.contestId}`}>
                                            <ExternalLinkIcon />
                                        </Link>
                                    </Td>
                                    <Td>
                                        <Text isTruncated>{d.contestName}</Text>
                                    </Td>
                                    <Td display={{ base: 'none', md: 'table-cell' }} w={'180px'}>
                                        <Flex alignItems={'center'} mb={2}>
                                            <Tag variant="outline" justifyContent={'center'} w={12} mr={2}>
                                                FROM
                                            </Tag>
                                            <Text>{dayjs.utc(d.startDateTime).local().format()}</Text>
                                        </Flex>
                                        <Flex alignItems={'center'}>
                                            <Tag variant="outline" justifyContent={'center'} w={12} mr={2}>
                                                TO
                                            </Tag>
                                            <Text>{dayjs.utc(d.endDateTime).local().format()}</Text>
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </DefaultLayout>
    )
}
