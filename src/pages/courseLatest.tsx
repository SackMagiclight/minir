import { Box, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr, Heading, Progress, Text } from '@chakra-ui/react'
import { Link as ReactLink } from 'react-router-dom'
import { DefaultLayout } from '~/layout/Default'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import { useGetCourceLatestQuery } from '../api'

export default () => {
    const {data, isLoading} = useGetCourceLatestQuery({
        count: 100,
    })

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
                            {data?.map((d, index) => (
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
