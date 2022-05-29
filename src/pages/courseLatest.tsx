import { Box, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Heading, Progress, Text } from '@chakra-ui/react'
import Lambda from 'aws-sdk/clients/lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import AWS from 'aws-sdk'
import { useEffect, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'

type CourseList = {
    name: string
    courcehash: string
}

export default () => {
    const [tableData, setTableData] = useState<CourseList[]>([])
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setTableData([])
        getLatestData()
    }, [])

    const getLatestData = async () => {
        const ks = getAccessKeyAndSecret('get_cource_played_100').split(',')
        AWS.config.update({
            accessKeyId: ks[0],
            secretAccessKey: ks[1],
        })
        const lambda = new Lambda()
        const params = {
            FunctionName: 'get_cource_played_100',
        }

        try {
            const data = await lambda.invoke(params).promise()
            const json = JSON.parse(data.Payload?.toString() ?? '')
            if (json.message == 'success') {
                setTableData(json.courceDatas)
            } else {
            }
        } catch{}
        finally{
            setLoading(false)
        }
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>Course Latest 100 played</title>
            </Helmet>
            <Box padding={4}>
                <Heading marginBottom={4}>Course Latest 100 played</Heading>
                {isLoading && <Progress size="xs" isIndeterminate />}
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
                                        <Link as={ReactLink} to={`/viewer/course/${d.courcehash}/0`}>
                                            <ExternalLinkIcon />
                                        </Link>
                                    </Td>
                                    <Td maxW={'95vw'}>
                                        <Text isTruncated>{d.name}</Text>
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
