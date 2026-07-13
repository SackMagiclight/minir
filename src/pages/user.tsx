import {
    Box,
    Progress,
    useBoolean,
    IconButton,
    Textarea,
    useToast,
    Link,
    Text,
    Button,
    Flex,
    Badge,
    Divider,
    Tooltip,
    Skeleton,
    SkeletonText,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { DefaultLayout } from '~/layout/Default'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Helmet } from 'react-helmet-async'
import { Link as ReactLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getTokens, getUserId, setAccessToken, setRefreshToken } from '../store/userStore'
import {
    useDeleteRivalRemoveMutation,
    useGetUserQuery,
    usePostMeMutation,
    usePostRivalAddMutation,
    usePutUserUpdateMutation,
} from '../api'
import { IMinIRScoreEntity, IMinIRUserEntity } from '../entities'
import { cloneDeep } from 'lodash'
import UserEventComponent from '~/components/userEvent/UserEventComponent'
import UserStatsComponent from '~/components/userStats/UserStatsComponent'

type UserDataLogin = {
    message: string
    scoreDatas: (IMinIRScoreEntity & { title: string; artist: string })[]
    userData: Omit<IMinIRUserEntity, 'rivals'> & {
        userName: string
        rivals: {
            userId: string
            userName: string | undefined
        }[]
    }
}

export default () => {
    const urlParams = useParams<{ userId?: string }>()
    const [isUpdateBio, setUpdateBio] = useBoolean()
    const toast = useToast()

    const [loginUserData, setLoginUserData] = useState<UserDataLogin>()
    const [loginUserBio, setLoginUserBio] = useState('')

    const tokens = useSelector(getTokens)
    const loginUserId = useSelector(getUserId)
    const [getUserDataQuery, userDataState] = usePostMeMutation()
    const { data: _userData, isFetching } = useGetUserQuery(
        { userId: urlParams.userId ?? '' },
        {
            skip: !urlParams.userId,
        },
    )
    const [putBioQuery] = usePutUserUpdateMutation()
    const dispatch = useDispatch()

    const userData = useMemo(() => {
        if (!_userData) return undefined
        if (!urlParams.userId || urlParams.userId === loginUserId) return undefined
        return _userData
    }, [_userData, urlParams.userId, loginUserId])

    const isMyPage = useMemo(() => {
        if (!loginUserData) return false
        return !urlParams.userId || loginUserData.userData.userid === urlParams.userId
    }, [loginUserData, urlParams])

    useEffect(() => {
        setLoginUserData(undefined)
        setLoginUserBio('')
        !(async () => {
            if (!!tokens.accessToken && !!tokens.refreshToken) {
                const data = await getUserDataQuery({
                    accessToken: tokens?.accessToken,
                    refreshToken: tokens?.refreshToken,
                }).unwrap()
                setLoginUserData(() => data)
                setLoginUserBio(() => data.userData.bio)
            } else {
                setLoginUserData(undefined)
                setLoginUserBio('')
            }
        })()
    }, [urlParams])

    const isRival = useMemo(() => {
        if (!loginUserData) return false
        return !!loginUserData.userData.rivals.find((r) => r.userId === urlParams.userId)
    }, [loginUserData])

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const id = urlParams.userId ?? loginUserData?.userData.userid
        if (id) {
            navigator.clipboard.writeText(id)
            toast({
                description: 'Copied.',
                status: 'success',
                duration: 1500,
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputValue = e.target.value
        setLoginUserBio(inputValue)
    }

    const updateBio = async () => {
        if (!isMyPage) return
        setUpdateBio.on()

        try {
            const result = await putBioQuery({
                accessToken: tokens?.accessToken ?? '',
                refreshToken: tokens?.refreshToken ?? '',
                bio: loginUserBio,
            }).unwrap()
            dispatch(setAccessToken(result.accessToken))
            dispatch(setRefreshToken(result.refreshToken))
            setLoginUserData((state) => {
                if (!state) return state
                const newVal = cloneDeep(state)
                newVal.userData.bio = result.dynamoUser.bio
                return newVal
            })

            toast({
                description: 'Successfully updated bio.',
                status: 'success',
                duration: 1500,
            })
        } catch (e) {
            toast({
                description: 'Failed to update bio.',
                status: 'error',
                duration: 1500,
            })
        } finally {
            setUpdateBio.off()
        }
    }

    const [addRivalQuery] = usePostRivalAddMutation()
    const [removeRivalQuery] = useDeleteRivalRemoveMutation()

    const addRemoveRival = async (command: 'add' | 'remove') => {
        if (isMyPage || !loginUserData) return

        try {
            if (command === 'add' && loginUserData.userData.rivals.length < 10) {
                const newRivals = await addRivalQuery({
                    accessToken: tokens?.accessToken ?? '',
                    refreshToken: tokens?.refreshToken ?? '',
                    rivalId: urlParams.userId ?? '',
                }).unwrap()
                setLoginUserData((state) => {
                    if (!state) return state
                    const newVal = cloneDeep(state)
                    newVal.userData.rivals = newRivals
                    return newVal
                })
            } else if (command === 'remove') {
                const newRivals = await removeRivalQuery({
                    accessToken: tokens?.accessToken ?? '',
                    refreshToken: tokens?.refreshToken ?? '',
                    rivalId: urlParams.userId ?? '',
                }).unwrap()
                setLoginUserData((state) => {
                    if (!state) return state
                    const newVal = cloneDeep(state)
                    newVal.userData.rivals = newRivals
                    return newVal
                })
            }

            toast({
                description: `Successfully ${command} rival.`,
                status: 'success',
                duration: 1500,
            })
        } catch (e) {
            toast({
                description: `Failed to ${command} rival.`,
                status: 'error',
                duration: 1500,
            })
        }
    }

    const scoreData = useMemo(() => {
        if (isMyPage) {
            return loginUserData?.scoreDatas.filter((d) => !!d)
        } else {
            return userData?.scoreDatas.filter((d) => !!d)
        }
    }, [userData, loginUserData, urlParams.userId, tokens.accessToken])

    const queryUserData = useMemo(() => {
        if (isMyPage) {
            return loginUserData?.userData
        } else {
            return userData?.userData
        }
    }, [userData, loginUserData, isMyPage])

    const isLoading = userDataState.isLoading || isFetching

    return (
        <DefaultLayout>
            <Helmet>
                <title>{queryUserData?.userName ?? ''}</title>
            </Helmet>

            {/* ローディングバー */}
            {isLoading && <Progress size="xs" isIndeterminate colorScheme="teal" />}

            <Box
                minH="100%"
                bg="gray.50"
                py={8}
                px={{ base: 4, md: 8 }}
            >
                {/* ローディングスケルトン */}
                {isLoading && (
                    <Box maxW="1200px" mx="auto">
                        <Box bg="white" borderRadius="2xl" p={8} shadow="sm" mb={4}>
                            <Box mb={6}>
                                <Skeleton h={8} w="40%" mb={2} />
                                <Skeleton h={4} w="25%" />
                            </Box>
                            <SkeletonText noOfLines={4} spacing={3} />
                        </Box>
                    </Box>
                )}

                {!!queryUserData && !isLoading && (
                    <Box maxW="1200px" mx="auto">

                        {/* ── プロフィールカード ── */}
                        <Box
                            bg="white"
                            borderRadius="2xl"
                            shadow="sm"
                            border="1px solid"
                            borderColor="gray.100"
                            overflow="hidden"
                            mb={5}
                        >
                            {/* ヘッダー帯 */}
                            <Box h="6px" bgGradient="linear(to-r, teal.400, cyan.300)" />

                            <Box p={{ base: 5, md: 8 }}>
                                {/* ユーザー名 */}
                                <Flex align="center" justify="space-between" mb={6}>
                                    <Box>
                                        <Text
                                            fontSize="3xl"
                                            fontWeight="800"
                                            letterSpacing="-1px"
                                            color="gray.900"
                                            lineHeight={1.1}
                                        >
                                            {queryUserData.userName}
                                        </Text>
                                        {!isMyPage && isRival && (
                                            <Badge
                                                mt={1.5}
                                                colorScheme="orange"
                                                variant="subtle"
                                                borderRadius="full"
                                                px={2.5}
                                                fontSize="xs"
                                                letterSpacing="0.04em"
                                            >
                                                Rival
                                            </Badge>
                                        )}
                                    </Box>
                                    {/* ライバル追加/削除ボタン（他人ページ） */}
                                    {!isMyPage && (
                                        <Box>
                                            {isRival ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    colorScheme="red"
                                                    borderRadius="full"
                                                    fontWeight="600"
                                                    onClick={() => addRemoveRival('remove')}
                                                >
                                                    Remove Rival
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    colorScheme="teal"
                                                    borderRadius="full"
                                                    fontWeight="600"
                                                    onClick={() => addRemoveRival('add')}
                                                >
                                                    + Add Rival
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Flex>

                                <Divider mb={5} borderColor="gray.100" />

                                {/* USER ID */}
                                <Flex
                                    align="center"
                                    gap={2}
                                    mb={4}
                                    px={3}
                                    py={2}
                                    bg="gray.50"
                                    borderRadius="lg"
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.400"
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                        minW="72px"
                                    >
                                        User ID
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        fontFamily="mono"
                                        color="gray.600"
                                        flex={1}
                                        isTruncated
                                    >
                                        {urlParams.userId ?? loginUserData?.userData.userid ?? ''}
                                    </Text>
                                    <Tooltip label="Copy ID" placement="top" hasArrow>
                                        <IconButton
                                            aria-label="copy user id"
                                            icon={<CopyIcon />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="gray"
                                            onClick={handleCopy}
                                        />
                                    </Tooltip>
                                </Flex>

                                {/* BIO */}
                                <Box mb={4}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.400"
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                        mb={2}
                                    >
                                        Bio
                                    </Text>
                                    {!!urlParams.userId ? (
                                        <Text
                                            fontSize="sm"
                                            color="gray.700"
                                            whiteSpace="pre-wrap"
                                            lineHeight={1.8}
                                            minH="60px"
                                        >
                                            {queryUserData?.bio ?? ''}
                                        </Text>
                                    ) : (
                                        <Flex flexDirection="column" gap={2}>
                                            <Textarea
                                                rows={6}
                                                value={loginUserBio}
                                                onChange={handleInputChange}
                                                fontSize="sm"
                                                borderRadius="lg"
                                                borderColor="gray.200"
                                                resize="vertical"
                                                _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
                                            />
                                            <Button
                                                isLoading={isUpdateBio}
                                                size="sm"
                                                colorScheme="teal"
                                                borderRadius="full"
                                                alignSelf="flex-end"
                                                fontWeight="600"
                                                px={6}
                                                onClick={() => updateBio()}
                                            >
                                                Update Bio
                                            </Button>
                                        </Flex>
                                    )}
                                </Box>

                                {/* ライバル一覧（自分のページ） */}
                                {isMyPage && loginUserData && !!loginUserData.userData.rivals?.length && (
                                    <Box mb={4}>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="700"
                                            color="gray.400"
                                            letterSpacing="0.08em"
                                            textTransform="uppercase"
                                            mb={2}
                                        >
                                            Rivals
                                        </Text>
                                        <Flex flexWrap="wrap" gap={2}>
                                            {loginUserData.userData.rivals.map((r, index) => (
                                                <Link
                                                    key={index}
                                                    as={ReactLink}
                                                    to={`/viewer/user/${r.userId}`}
                                                    _hover={{ textDecoration: 'none' }}
                                                >
                                                    <Badge
                                                        colorScheme="teal"
                                                        variant="subtle"
                                                        borderRadius="full"
                                                        px={3}
                                                        py={1}
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                        cursor="pointer"
                                                        _hover={{ bg: 'teal.100' }}
                                                    >
                                                        {r.userName}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* 連携サービス */}
                                {isMyPage && loginUserData && !!loginUserData.userData.services?.length && (
                                    <Box>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="700"
                                            color="gray.400"
                                            letterSpacing="0.08em"
                                            textTransform="uppercase"
                                            mb={2}
                                        >
                                            Connected
                                        </Text>
                                        <Flex gap={2} flexWrap="wrap">
                                            {loginUserData.userData.services.map((r, index) => (
                                                <Box key={index}>
                                                    {r === 'Stella' && (
                                                        <Link href="https://stellabms.xyz/" isExternal _hover={{ textDecoration: 'none' }}>
                                                            <Badge
                                                                colorScheme="purple"
                                                                variant="subtle"
                                                                borderRadius="full"
                                                                px={3}
                                                                py={1}
                                                                fontSize="xs"
                                                                fontWeight="600"
                                                                cursor="pointer"
                                                                _hover={{ bg: 'purple.100' }}
                                                            >
                                                                Stella <ExternalLinkIcon mx="2px" />
                                                            </Badge>
                                                        </Link>
                                                    )}
                                                </Box>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* ── スコアリスト ── */}
                        {!!scoreData?.length && (
                            <Box
                                bg="white"
                                borderRadius="2xl"
                                shadow="sm"
                                border="1px solid"
                                borderColor="gray.100"
                                overflow="hidden"
                                mb={5}
                            >
                                <Box px={{ base: 5, md: 8 }} pt={6} pb={3}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.400"
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                    >
                                        Scores
                                    </Text>
                                </Box>

                                {/* ヘッダー行 */}
                                <Flex
                                    px={{ base: 5, md: 8 }}
                                    py={2}
                                    bg="gray.50"
                                    borderTop="1px solid"
                                    borderColor="gray.100"
                                    gap={2}
                                >
                                    <Text fontSize="xs" fontWeight="700" color="gray.400" w="36px" textAlign="center">IR</Text>
                                    <Text fontSize="xs" fontWeight="700" color="gray.400" w="52px" textAlign="center">SCORE</Text>
                                    <Text fontSize="xs" fontWeight="700" color="gray.400" flex={1}>TITLE</Text>
                                </Flex>

                                {/* スコア行 */}
                                <Box>
                                    {scoreData.map((d, index) => (
                                        <Flex
                                            key={index}
                                            px={{ base: 5, md: 8 }}
                                            py={3}
                                            gap={2}
                                            align="center"
                                            borderTop="1px solid"
                                            borderColor="gray.50"
                                            _hover={{ bg: 'gray.50' }}
                                            transition="background 0.15s"
                                        >
                                            <Box w="36px" textAlign="center">
                                                <Link
                                                    as={ReactLink}
                                                    to={`/viewer/${
                                                        d.songhash.split('.')[0].length == 67 ? 'course' : 'song'
                                                    }/${d.songhash.split('.')[0]}/0`}
                                                    color="teal.500"
                                                    _hover={{ color: 'teal.600' }}
                                                >
                                                    <ExternalLinkIcon boxSize={3.5} />
                                                </Link>
                                            </Box>
                                            <Box w="52px" textAlign="center">
                                                <Link
                                                    as={ReactLink}
                                                    to={`/viewer/${
                                                        d.songhash.split('.')[0].length == 67 ? 'course' : 'song'
                                                    }/${d.songhash.split('.')[0]}/${d.songhash.split('.')[1]}/score/${d.userid}`}
                                                    color="teal.500"
                                                    _hover={{ color: 'teal.600' }}
                                                >
                                                    <ExternalLinkIcon boxSize={3.5} />
                                                </Link>
                                            </Box>
                                            <Text
                                                fontSize="sm"
                                                color="gray.700"
                                                flex={1}
                                                isTruncated
                                                fontWeight="500"
                                            >
                                                {d.title}
                                            </Text>
                                        </Flex>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* ── 統計 & イベント ── */}
                        {isMyPage && loginUserData && (
                            <Box
                                bg="white"
                                borderRadius="2xl"
                                shadow="sm"
                                border="1px solid"
                                borderColor="gray.100"
                            >
                                <UserStatsComponent />
                                <Divider borderColor="gray.100" />
                                <UserEventComponent userId={loginUserData.userData.userid} />
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </DefaultLayout>
    )
}
