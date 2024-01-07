import {
    Box,
    Button,
    Flex,
    FormControl,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Stack,
    useBoolean,
    useDisclosure,
    Container,
    Heading,
    FormErrorMessage,
} from '@chakra-ui/react'
import { DefaultLayout } from '~/layout/Default'
import { Helmet } from 'react-helmet-async'
import { FaLock } from 'react-icons/fa'
import { useEffect, useMemo, useState } from 'react'
import { Link as ReactLink, useNavigate } from 'react-router-dom'
import React from 'react'
import { MdAlternateEmail } from 'react-icons/md'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { usePostForgetConfirmMutation, usePostForgetMutation } from '../api'

export default () => {
    const [showPassword, setShowPassword] = useBoolean()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isLoading, setLoading] = useBoolean()
    const [verifyCode, setVerifyCode] = useState<string>()
    const [email, setEmail] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
        initialStep: 0,
    })

    const changeVerifyCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVerifyCode(e.target.value)
    }
    const changeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    const changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const [resetPasswordQuery] = usePostForgetMutation()
    const resetRequest = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!email) return
        e.preventDefault()
        setLoading.on()
        !(async () => {
            try {
                await resetPasswordQuery({ email }).unwrap()
                nextStep()
            } catch (e: any) {
                console.log(JSON.stringify(e, undefined, 1))
                setErrorMessage(e.message)
            } finally {
                setLoading.off()
            }
        })()
    }

    const [confirmPasswordQuery] = usePostForgetConfirmMutation()
    const clickSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!verifyCode || !email || !password) return
        e.preventDefault()
        setLoading.on()
        !(async () => {
            try {
                await confirmPasswordQuery({ email, password, code: verifyCode }).unwrap()
                nextStep()
            } catch (e: any) {
                console.log(JSON.stringify(e, undefined, 1))
                setErrorMessage(e.message)
            } finally {
                setLoading.off()
            }
        })()
    }

    const [errors, setErrors] = useState({ verifyCode: '', email: '', password: '' })
    useEffect(() => {
        const newState = { verifyCode: '', email: '', password: '' }
        if (verifyCode !== undefined && !verifyCode) {
            newState.verifyCode = 'User name is required.'
        }

        if (email !== undefined && !email) {
            newState.email = 'email is required.'
        }

        if (password !== undefined && !password) {
            newState.password = 'password is required.'
        } else if (password !== undefined && password.length < 8) {
            newState.password = 'password must be at least 8 characters.'
        }

        setErrors(newState)
    }, [verifyCode, email, password])

    const valid = useMemo(() => {
        return !errors.verifyCode && !errors.email && !errors.password && verifyCode && email && password
    }, [errors, verifyCode, email, password])

    const validEmail = useMemo(() => {
        return !errors.email && email
    }, [errors, email])

    return (
        <DefaultLayout>
            <Helmet>
                <title>Reset your password</title>
            </Helmet>
            <Flex mt={4} flexDirection="column" justifyContent="center" alignItems="center">
                <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
                    <Steps activeStep={activeStep}>
                        <Step label={'Step 1'} description={'Input Your email'}>
                            <Box minW={{ base: '90%', md: '468px' }}>
                                <form>
                                    <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
                                        {!!errorMessage && (
                                            <Container color={'red.500'} borderWidth="1px" borderRadius="lg">
                                                Error: {errorMessage}
                                            </Container>
                                        )}
                                        <FormControl isInvalid={!!errors.email}>
                                            <InputGroup>
                                                <InputLeftElement
                                                    pointerEvents="none"
                                                    children={<MdAlternateEmail color="#CBD5E0" />}
                                                />
                                                <Input
                                                    isRequired
                                                    name="email"
                                                    type="email"
                                                    placeholder="email address"
                                                    onChange={changeEmail}
                                                    value={email}
                                                />
                                            </InputGroup>
                                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                                        </FormControl>
                                        <Button size="sm" onClick={resetRequest} isLoading={isLoading} isDisabled={!validEmail}>
                                            {'Next'}
                                        </Button>
                                    </Stack>
                                </form>
                            </Box>
                        </Step>
                        <Step label={'Step 2'} description={'Reset Password'}>
                            <Box minW={{ base: '90%', md: '468px' }}>
                                <form>
                                    <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
                                        {!!errorMessage && (
                                            <Container color={'red.500'} borderWidth="1px" borderRadius="lg">
                                                Error: {errorMessage}
                                            </Container>
                                        )}
                                        <FormControl isInvalid={!!errors.verifyCode}>
                                            <InputGroup>
                                                <InputLeftElement
                                                    pointerEvents="none"
                                                    children={<MdAlternateEmail color="#CBD5E0" />}
                                                />
                                                <Input
                                                    isRequired
                                                    name="verifyCode"
                                                    type="number"
                                                    placeholder="verify code"
                                                    onChange={changeVerifyCode}
                                                    value={verifyCode}
                                                />
                                            </InputGroup>
                                            <FormErrorMessage>{errors.verifyCode}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={!!errors.password}>
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
                                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                                        </FormControl>
                                        <Button size="sm" onClick={clickSubmit} isLoading={isLoading} disabled={!valid}>
                                            {'Reset password'}
                                        </Button>
                                    </Stack>
                                </form>
                            </Box>
                        </Step>
                    </Steps>
                    {activeStep === 2 && (
                        <>
                            <Heading fontSize="xl" textAlign="center">
                                Reset Success
                            </Heading>
                            <Text textAlign={'center'}>
                                Please login to new Password.
                                <br />
                                新しいパスワードでログインしてください。
                            </Text>
                            <Button as={ReactLink} to={'/login'}>
                                Return to Login page
                            </Button>
                        </>
                    )}
                </Stack>
            </Flex>
        </DefaultLayout>
    )
}
