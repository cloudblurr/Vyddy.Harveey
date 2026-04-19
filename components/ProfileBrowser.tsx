"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  VStack,
  Badge,
  useToast,
  Code,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAtSign,
  FiExternalLink,
  FiArrowRight,
  FiTwitter,
  FiInstagram,
  FiGlobe,
  FiX,
  FiLink,
  FiZap,
  FiCheckCircle,
  FiCopy,
} from "react-icons/fi";

const MotionBox = motion(Box);

type Platform = "twitter" | "instagram" | "other";

const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; icon: React.ElementType; buildUrl: (h: string) => string; color: string }
> = {
  twitter: {
    label: "Twitter / X",
    icon: FiTwitter,
    buildUrl: (h) => `https://x.com/${h}`,
    color: "#1d9bf0",
  },
  instagram: {
    label: "Instagram",
    icon: FiInstagram,
    buildUrl: (h) => `https://www.instagram.com/${h}/`,
    color: "#e1306c",
  },
  other: {
    label: "Other",
    icon: FiGlobe,
    buildUrl: (h) => (h.startsWith("http") ? h : `https://${h}`),
    color: "#888",
  },
};

interface ProfileBrowserProps {
  onSendToExtractor: (url: string) => void;
}

export default function ProfileBrowser({ onSendToExtractor }: ProfileBrowserProps) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState("");
  const toast = useToast();

  const cfg = PLATFORM_CONFIG[platform];

  const handleOpen = () => {
    const h = handle.trim().replace(/^@/, "");
    if (!h) return;
    const url = cfg.buildUrl(h);
    setProfileUrl(url);
    // Open in new tab
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Profile opened in new tab",
      description: "Copy a post link and paste it below to extract media.",
      status: "info",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleSend = () => {
    const url = postUrl.trim();
    if (!url) return;
    onSendToExtractor(url);
    setPostUrl(""); // Clear after sending
    toast({
      title: "Sent to URL Extractor",
      description: "Switched to Extract tab — extracting media now.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const copyProfileUrl = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    <VStack spacing={5} align="stretch">
      {/* ── Top bar: platform + handle ── */}
      <MotionBox
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        p={5}
      >
        <Text
          fontSize="xs"
          color="#555"
          fontWeight="600"
          letterSpacing="0.1em"
          textTransform="uppercase"
          mb={4}
        >
          Profile Browser
        </Text>

        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          {/* Platform pills */}
          <Flex gap={2} flexShrink={0}>
            {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((p) => {
              const c = PLATFORM_CONFIG[p];
              const PIcon = c.icon;
              const active = platform === p;
              return (
                <Button
                  key={p}
                  size="md"
                  h="44px"
                  px={3}
                  bg={active ? "#ffeb3b" : "#111"}
                  color={active ? "#000" : "#666"}
                  border={active ? "none" : "1px solid #1a1a1a"}
                  borderRadius="10px"
                  onClick={() => setPlatform(p)}
                  leftIcon={<Icon as={PIcon} boxSize={3.5} />}
                  fontWeight={active ? "700" : "500"}
                  fontSize="xs"
                  _hover={{ bg: active ? "#ffff72" : "#1a1a1a" }}
                  transition="all 0.15s"
                >
                  {c.label}
                </Button>
              );
            })}
          </Flex>

          {/* Handle / URL input */}
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <Icon
                as={platform === "other" ? FiGlobe : FiAtSign}
                color="#555"
                boxSize={4}
              />
            </InputLeftElement>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOpen()}
              placeholder={
                platform === "other" ? "domain.com or full URL" : "username"
              }
              size="md"
              h="44px"
              pl={10}
              fontSize="sm"
            />
            {handle && (
              <InputRightElement h="full" pr={1}>
                <Icon
                  as={FiX}
                  color="#555"
                  boxSize={4}
                  cursor="pointer"
                  onClick={() => setHandle("")}
                  _hover={{ color: "white" }}
                />
              </InputRightElement>
            )}
          </InputGroup>

          <Button
            variant="neon"
            size="md"
            h="44px"
            px={7}
            onClick={handleOpen}
            rightIcon={<Icon as={FiExternalLink} />}
            flexShrink={0}
          >
            Open Profile
          </Button>
        </Flex>
      </MotionBox>

      {/* ── Instructions card ── */}
      <AnimatePresence>
        {profileUrl && (
          <MotionBox
            key="instructions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            bg="#0d0d0d"
            border="1px solid #1a1a1a"
            borderRadius="16px"
            p={5}
          >
            <HStack spacing={3} mb={4}>
              <Box
                w="32px"
                h="32px"
                bg="#ffeb3b22"
                border="1px solid #ffeb3b33"
                borderRadius="8px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiCheckCircle} color="#ffeb3b" boxSize={4} />
              </Box>
              <Box flex={1}>
                <Text fontWeight="700" fontSize="sm" color="white">
                  Profile opened in new tab
                </Text>
                <Text fontSize="xs" color="#666">
                  Follow the steps below to extract media
                </Text>
              </Box>
            </HStack>

            <List spacing={2.5} pl={2}>
              <ListItem fontSize="sm" color="#888">
                <HStack spacing={2} align="flex-start">
                  <Text color="#ffeb3b" fontWeight="700" fontSize="xs" mt={0.5}>
                    1.
                  </Text>
                  <Text>
                    Browse the profile in the new tab and find a post/reel/tweet you want
                  </Text>
                </HStack>
              </ListItem>
              <ListItem fontSize="sm" color="#888">
                <HStack spacing={2} align="flex-start">
                  <Text color="#ffeb3b" fontWeight="700" fontSize="xs" mt={0.5}>
                    2.
                  </Text>
                  <Text>
                    Right-click the post → <Code fontSize="xs" bg="#111" color="#ffeb3b" px={1}>Copy link</Code> (or copy from address bar)
                  </Text>
                </HStack>
              </ListItem>
              <ListItem fontSize="sm" color="#888">
                <HStack spacing={2} align="flex-start">
                  <Text color="#ffeb3b" fontWeight="700" fontSize="xs" mt={0.5}>
                    3.
                  </Text>
                  <Text>
                    Paste the link below and hit <Text as="span" color="#ffeb3b" fontWeight="600">Send to Extractor</Text>
                  </Text>
                </HStack>
              </ListItem>
            </List>

            <Flex
              mt={4}
              p={3}
              bg="#111"
              border="1px solid #1a1a1a"
              borderRadius="8px"
              align="center"
              justify="space-between"
              gap={3}
            >
              <HStack spacing={2} flex={1} minW={0}>
                <Icon as={FiLink} color="#555" boxSize={3.5} flexShrink={0} />
                <Text fontSize="xs" color="#666" isTruncated>
                  {profileUrl}
                </Text>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                color="#ffeb3b"
                leftIcon={<Icon as={FiCopy} boxSize={3} />}
                onClick={copyProfileUrl}
                _hover={{ bg: "#ffeb3b11" }}
                flexShrink={0}
              >
                Copy
              </Button>
            </Flex>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ── Send-to-extractor bar ── */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        p={5}
      >
        <Text
          fontSize="xs"
          color="#555"
          fontWeight="600"
          letterSpacing="0.08em"
          textTransform="uppercase"
          mb={3}
        >
          Send Post URL to Extractor
        </Text>

        <Flex gap={3} direction={{ base: "column", sm: "row" }}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <Icon as={FiLink} color="#555" boxSize={4} />
            </InputLeftElement>
            <Input
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Paste a post / reel / tweet URL here…"
              size="md"
              h="44px"
              pl={10}
              fontSize="sm"
            />
            {postUrl && (
              <InputRightElement h="full" pr={1}>
                <Icon
                  as={FiX}
                  color="#555"
                  boxSize={4}
                  cursor="pointer"
                  onClick={() => setPostUrl("")}
                  _hover={{ color: "white" }}
                />
              </InputRightElement>
            )}
          </InputGroup>

          <Button
            variant="neon"
            size="md"
            h="44px"
            px={6}
            onClick={handleSend}
            rightIcon={<Icon as={FiArrowRight} />}
            isDisabled={!postUrl.trim()}
            flexShrink={0}
          >
            Send to Extractor
          </Button>
        </Flex>

        <Text mt={2.5} fontSize="xs" color="#444">
          Works with Instagram posts/reels, Twitter/X tweets, and any other media URL.
        </Text>
      </MotionBox>

      {/* ── Empty state ── */}
      {!profileUrl && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          textAlign="center"
          py={12}
        >
          <Box
            w="64px"
            h="64px"
            bg="#111"
            border="1px solid #1a1a1a"
            borderRadius="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={4}
          >
            <Icon as={FiGlobe} color="#333" boxSize={7} />
          </Box>
          <Text color="#444" fontSize="sm" fontWeight="600">
            Enter a handle above to open their profile
          </Text>
          <Text color="#333" fontSize="xs" mt={1.5}>
            Browse naturally, copy post links, send them to the extractor
          </Text>
        </MotionBox>
      )}
    </VStack>
  );
}
