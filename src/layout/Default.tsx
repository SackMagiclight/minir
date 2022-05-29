import { ReactNode } from 'react'
import Header from '~/components/uiParts/Header/header'
import { Box, Flex } from '@chakra-ui/react'

export type DefaultLayoutProps = {
    children: ReactNode
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
    return (
        <Flex direction={'column'} h="100vh">
            <Header />
            <Box flex={1} overflowY="scroll">
                {children}
            </Box>
        </Flex>
    )
}
