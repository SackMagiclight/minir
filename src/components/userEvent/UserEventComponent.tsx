import { useGetUserEventQuery } from '~/api'
import { Box, Flex, Heading } from '@chakra-ui/react'
import UserEventUpdateLog from '~/components/userEvent/UserEventUpdateLog'
import dayjs from 'dayjs'

export default ({userId}: { userId: string}) => {
    const { data: _userEventData } = useGetUserEventQuery({
        userId: userId
    })

    return (
        <Box w={`100%`} p={4}>
            <Box w={`100%`} p={4} textAlign={`center`}>
                <Heading>
                    Record for {dayjs().format("YYYY/MM/DD")}
                </Heading>
            </Box>
            <Flex>
                <UserEventUpdateLog eventList={_userEventData?.eventList || []} />
            </Flex>
        </Box>
    )
}