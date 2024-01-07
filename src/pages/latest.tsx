import { Box, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Heading, Progress, Text } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { getAccessKeyAndSecret } from '~/util/decrypt'
import { useEffect, useState } from 'react'
import { Link as ReactLink } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import { useGetSongLatestQuery } from '../api'

export default () => {
    const urlParams = useParams<{ key: string }>()
    const {data, isLoading} = useGetSongLatestQuery({
        mode: urlParams.key ?? 'beat-7k',
        count: 100,
    })

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
                            {data?.map((d, index) => (
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
