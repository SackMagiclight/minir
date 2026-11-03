import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Alert,
    AlertIcon,
    Box,
    Flex,
    Heading,
    Link,
    Stack,
    Text,
} from '@chakra-ui/react'
import notices from '~/static/important-notices.json'

type ImportantNotice = {
    id: string
    enabled: boolean
    status: 'info' | 'warning' | 'error' | 'success'
    date: string
    title: string
    summary: string
    primaryLink?: { label: string; url: string }
    paragraphs: string[]
    links?: { label: string; url: string }[]
}

const importantNotices: ImportantNotice[] = notices as ImportantNotice[]

export const ImportantNotices = () => {
    const visibleNotices = importantNotices.filter((notice) => notice.enabled)

    if (visibleNotices.length === 0) return null

    return (
        <Stack spacing={3} margin={4}>
            {visibleNotices.map((notice) => (
                <Alert
                    key={notice.id}
                    as="section"
                    role="region"
                    aria-labelledby={`notice-${notice.id}`}
                    status={notice.status}
                    variant="left-accent"
                    alignItems="flex-start"
                    padding={{ base: 3, md: 4 }}
                    borderRadius="md"
                >
                    <AlertIcon flexShrink={0} marginTop={1} />
                    <Box minWidth={0} flex={1} overflowWrap="anywhere">
                        <Flex alignItems="baseline" gap={2} flexWrap="wrap">
                            <Heading as="h2" id={`notice-${notice.id}`} size="sm" lineHeight="tall">
                                {notice.title}
                            </Heading>
                            <Text fontSize="xs">掲載日：{notice.date}</Text>
                        </Flex>
                        <Text fontSize="sm" marginTop={1} lineHeight="tall" whiteSpace="pre-line">
                            {notice.summary}
                        </Text>
                        <Accordion allowToggle marginTop={1}>
                            <AccordionItem border="none">
                                {({ isExpanded }) => (
                                    <>
                                        <Flex alignItems="center" gap={4} flexWrap="wrap">
                                            {notice.primaryLink && (
                                                <Link href={notice.primaryLink.url} isExternal fontSize="sm" textDecoration="underline">
                                                    {notice.primaryLink.label}
                                                </Link>
                                            )}
                                            <Box as="h3">
                                                <AccordionButton width="auto" paddingX={0} paddingY={1} gap={1} fontSize="sm">
                                                    詳細を{isExpanded ? '閉じる' : '表示'}
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </Box>
                                        </Flex>
                                        <AccordionPanel padding={0} paddingTop={2}>
                                            <Stack spacing={3} fontSize="sm">
                                                {notice.paragraphs.map((paragraph, index) => (
                                                    <Text key={index} lineHeight="tall" whiteSpace="pre-line">
                                                        {paragraph}
                                                    </Text>
                                                ))}
                                                {notice.links && notice.links.length > 0 && (
                                                    <Stack spacing={2} alignItems="flex-start">
                                                        {notice.links.map((link) => (
                                                            <Link key={link.url} href={link.url} isExternal textDecoration="underline">
                                                                {link.label}
                                                            </Link>
                                                        ))}
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </AccordionPanel>
                                    </>
                                )}
                            </AccordionItem>
                        </Accordion>
                    </Box>
                </Alert>
            ))}
        </Stack>
    )
}
