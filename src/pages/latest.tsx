import { Box, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Heading, Progress, Text } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import Lambda from 'aws-sdk/clients/lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import AWS from 'aws-sdk'
import { useEffect, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'

type SongList = {
    title: string
    artist: string
    songhash: string
}

export default () => {
    const urlParams = useParams<{ key: string }>()
    const [tableData, setTableData] = useState<SongList[]>([])
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setTableData([])
        getLatestData()
    }, [urlParams.key])

    const getLatestData = () => {
        const ks = getAccessKeyAndSecret('get_played_100').split(',')
        AWS.config.update({
            accessKeyId: ks[0],
            secretAccessKey: ks[1],
        })
        const lambda = new Lambda()
        const params = {
            FunctionName: 'get_played_100',
            Payload: JSON.stringify({
                mode: urlParams.key ?? 'beat-7k',
            }),
        }

        lambda.invoke(params, function (err, data) {
            if (err) {
            } else {
                var json = JSON.parse(data.Payload?.toString() ?? '')
                if (json.message == 'success') {
                    setTableData(json.songDatas)
                } else {
                }
            }
            setLoading(false)
        })
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>{urlParams.key} Latest 100 played</title>
            </Helmet>
            <Box padding={4}>
                <Heading marginBottom={4}>{urlParams.key} Latest 100 played</Heading>
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
                                        <Link as={ReactLink} to={`/viewer/song/${d.songhash}/0`}>
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
            </Box>
        </DefaultLayout>
    )
}
