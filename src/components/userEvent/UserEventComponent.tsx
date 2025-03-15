import { useGetUserEventQuery } from '~/api'
import { Box, Button, Flex, Heading, HStack } from '@chakra-ui/react'
import UserEventUpdateLog from '~/components/userEvent/UserEventUpdateLog'
import dayjs from 'dayjs'
import { useState } from 'react'
import { CiSquareChevLeft, CiSquareChevRight } from "react-icons/ci";

export default ({userId}: { userId: string}) => {
    const [targetDate, setTargetDate] = useState(dayjs().toISOString())
    const { data: _userEventData } = useGetUserEventQuery({
        userId: userId,
        date: targetDate
    })

    const handlePrevDate = () => {
        setTargetDate(dayjs(targetDate).subtract(1, 'day').toISOString())
    }
    const handleNextDate = () => {
        // 今日の日付を超えないようにする
        if (dayjs(targetDate).isBefore(dayjs(), 'day')) {
            setTargetDate(dayjs(targetDate).add(1, 'day').toISOString())
        }
    }

    return (
        <Box w={`100%`} p={4}>
                <HStack w={`100%`} p={4} justifyContent={`center`} >
                    <Button backgroundColor={`inherit`} variant="solid" p={0} onClick={handlePrevDate}>
                        <CiSquareChevLeft size={32} />
                    </Button>
                    <Heading>
                        Record for {dayjs(targetDate).format("YYYY/MM/DD")}
                    </Heading>
                    <Button backgroundColor={`inherit`} p={0} onClick={handleNextDate}>
                        <CiSquareChevRight size={32} />
                    </Button>
                </HStack>
            <Flex>
                <UserEventUpdateLog eventList={_userEventData?.eventList || []} />
            </Flex>
        </Box>
    )
}