import {
    Box,
    Button,
    Flex,
    FormControl,
    FormHelperText,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Link,
    Stack,
    Text,
    useBoolean,
} from '@chakra-ui/react'
import { DefaultLayout } from '~/layout/Default'
import { Helmet } from 'react-helmet-async'
import { FaLock, FaUserAlt } from 'react-icons/fa'
import { useState } from 'react'
import { Link as ReactLink, useNavigate } from 'react-router-dom'
import { MdAlternateEmail } from 'react-icons/md'
import { usePostForgetMutation, usePostLoginMutation, usePostMeMutation } from '../api'
import { useDispatch } from 'react-redux'
import { setAccessToken, setRefreshToken, setUserId } from '../../store/userStore'

export default () => {
    const [showPassword, setShowPassword] = useBoolean()
    const [isLoading, setLoading] = useBoolean()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string>()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [loginQuery] = usePostLoginMutation()
    const [meQuery] = usePostMeMutation()

    const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const clickSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setLoading.toggle()
        !(async () => {
            try {
                setErrorMessage(undefined)
                const { accessToken, refreshToken } = await loginQuery({ email, password }).unwrap()
                dispatch(setAccessToken(accessToken))
                dispatch(setRefreshToken(refreshToken))
                const { userData } = await meQuery({
                    accessToken,
                    refreshToken,
                }).unwrap()
                dispatch(setUserId(userData.userid))
                navigate('/viewer/user')
            } catch (e) {
                console.log(JSON.stringify(e, undefined, 1))
                setErrorMessage((e as { message: string }).message)
            } finally {
                setLoading.toggle()
            }
        })()
    }

    return (
        <DefaultLayout>
            <Helmet>
                <title>Login</title>
            </Helmet>
            <Flex mt={4} flexDirection="column" justifyContent="center" alignItems="center">
                <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
                    <Box minW={{ base: '90%', md: '468px' }}>
                        <form>
                            <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
                                {errorMessage && <Text color="red.500">{errorMessage}</Text>}
                                <FormControl>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" children={<MdAlternateEmail color="#CBD5E0" />} />
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="email address"
                                            onChange={changeEmail}
                                            value={email}
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl isDisabled={isLoading}>
                                    <InputGroup>
                                        <InputLeftElement
                                            pointerEvents="none"
                                            color="gray.300"
                                            children={<FaLock color="#CBD5E0" />}
                                        />
                                        <Input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="password"
                                            onChange={changePassword}
                                            value={password}
                                        />
                                        <InputRightElement width="4.5rem">
                                            <Button h="1.75rem" size="sm" onClick={setShowPassword.toggle}>
                                                {showPassword ? 'Hide' : 'Show'}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    <FormHelperText textAlign="right">
                                        <Link as={ReactLink} to={'/reset-password'}>
                                            Forgot your password?
                                        </Link>
                                    </FormHelperText>
                                </FormControl>
                                <Button
                                    isLoading={isLoading}
                                    borderRadius={0}
                                    type="submit"
                                    variant="solid"
                                    colorScheme="teal"
                                    width="full"
                                    onClick={clickSubmit}>
                                    Login
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                </Stack>
                <Box>
                    New to us?{' '}
                    <Link as={ReactLink} color="teal.500" to={'/signup'}>
                        Create Account
                    </Link>
                </Box>
            </Flex>
        </DefaultLayout>
    )
}
