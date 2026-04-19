"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  VStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiCpu,
  FiUser,
  FiDownload,
  FiZap,
  FiPlus,
} from "react-icons/fi";
import { AgentMessage, DownloadItem } from "@/types";
import MediaCard from "./MediaCard";

const MotionBox = motion(Box);

interface AgentChatProps {
  onAddToQueue: (items: DownloadItem[]) => void;
}

const SUGGESTED_PROMPTS = [
  "Extract all videos from https://example.com",
  "Find all images on this page and download them",
  "Scrape media from a Twitter thread",
  "Download all media from an Erome album",
];

export default function AgentChat({ onAddToQueue }: AgentChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm Harveey's AI agent. Give me any URL or describe what you want to harvest — I'll extract all the media for you. I can handle adult sites, social media, embedded players, and more.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      const assistantMsg: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I couldn't process that request.",
        timestamp: new Date(),
        mediaItems: data.mediaItems || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.mediaItems?.length > 0) {
        toast({
          title: `Found ${data.mediaItems.length} media items`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I ran into an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMediaToQueue = (items: DownloadItem[]) => {
    onAddToQueue(items);
    toast({
      title: `${items.length} item${items.length !== 1 ? "s" : ""} added to queue`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    <VStack spacing={4} align="stretch" h="calc(100vh - 280px)" minH="500px">
      {/* Chat area */}
      <Box
        flex={1}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          align="center"
          px={5}
          py={3}
          borderBottom="1px solid #1a1a1a"
          bg="#0a0a0a"
        >
          <HStack spacing={3}>
            <Box
              w="32px"
              h="32px"
              bg="#ffeb3b"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCpu} color="black" boxSize={4} />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="700">Harveey Agent</Text>
              <HStack spacing={1.5}>
                <Box w={1.5} h={1.5} bg="#4ade80" borderRadius="full" />
                <Text fontSize="xs" color="#555">Online · Powered by DigitalOcean AI</Text>
              </HStack>
            </Box>
          </HStack>
        </Flex>

        {/* Messages */}
        <Box flex={1} overflowY="auto" p={4}>
          <VStack spacing={4} align="stretch">
            <AnimatePresence>
              {messages.map((msg) => (
                <MotionBox
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Flex
                    gap={3}
                    direction={msg.role === "user" ? "row-reverse" : "row"}
                    align="flex-start"
                  >
                    {/* Avatar */}
                    <Box
                      w="32px"
                      h="32px"
                      borderRadius="8px"
                      bg={msg.role === "assistant" ? "#ffeb3b" : "#1a1a1a"}
                      border={msg.role === "user" ? "1px solid #2a2a2a" : "none"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon
                        as={msg.role === "assistant" ? FiZap : FiUser}
                        color={msg.role === "assistant" ? "black" : "#666"}
                        boxSize={3.5}
                      />
                    </Box>

                    {/* Bubble */}
                    <Box maxW="80%">
                      <Box
                        bg={msg.role === "user" ? "#1a1a1a" : "#111"}
                        border={`1px solid ${msg.role === "user" ? "#2a2a2a" : "#1a1a1a"}`}
                        borderRadius={msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px"}
                        px={4}
                        py={3}
                      >
                        <Text fontSize="sm" color="white" lineHeight={1.6} whiteSpace="pre-wrap">
                          {msg.content}
                        </Text>
                      </Box>

                      {/* Media items from agent */}
                      {msg.mediaItems && msg.mediaItems.length > 0 && (
                        <Box mt={3}>
                          <Flex align="center" justify="space-between" mb={2}>
                            <Text fontSize="xs" color="#555" fontWeight="600">
                              {msg.mediaItems.length} media items found
                            </Text>
                            <Button
                              size="xs"
                              variant="neon"
                              leftIcon={<Icon as={FiPlus} />}
                              onClick={() => handleAddMediaToQueue(msg.mediaItems!)}
                            >
                              Add All to Queue
                            </Button>
                          </Flex>
                          <Flex gap={2} flexWrap="wrap">
                            {msg.mediaItems.slice(0, 8).map((item) => (
                              <Box key={item.url} w="72px" h="72px">
                                <MediaCard
                                  item={item}
                                  selected={false}
                                  onToggle={() => {}}
                                />
                              </Box>
                            ))}
                            {msg.mediaItems.length > 8 && (
                              <Box
                                w="72px"
                                h="72px"
                                bg="#111"
                                border="1px solid #1a1a1a"
                                borderRadius="10px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize="xs" color="#555" fontWeight="600">
                                  +{msg.mediaItems.length - 8}
                                </Text>
                              </Box>
                            )}
                          </Flex>
                        </Box>
                      )}

                      <Text fontSize="10px" color="#333" mt={1} textAlign={msg.role === "user" ? "right" : "left"}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </Box>
                  </Flex>
                </MotionBox>
              ))}
            </AnimatePresence>

            {loading && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Flex gap={3} align="flex-start">
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="8px"
                    bg="#ffeb3b"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={FiZap} color="black" boxSize={3.5} />
                  </Box>
                  <Box
                    bg="#111"
                    border="1px solid #1a1a1a"
                    borderRadius="4px 12px 12px 12px"
                    px={4}
                    py={3}
                  >
                    <HStack spacing={1.5}>
                      {[0, 1, 2].map((i) => (
                        <MotionBox
                          key={i}
                          w="6px"
                          h="6px"
                          bg="#ffeb3b"
                          borderRadius="full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </HStack>
                  </Box>
                </Flex>
              </MotionBox>
            )}

            <div ref={bottomRef} />
          </VStack>
        </Box>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <Box px={4} pb={3}>
            <Text fontSize="xs" color="#444" mb={2}>Try asking:</Text>
            <Flex gap={2} flexWrap="wrap">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Box
                  key={prompt}
                  px={3}
                  py={1.5}
                  bg="#111"
                  border="1px solid #1a1a1a"
                  borderRadius="8px"
                  cursor="pointer"
                  onClick={() => sendMessage(prompt)}
                  _hover={{ border: "1px solid #ffeb3b44", color: "#ffeb3b" }}
                  transition="all 0.15s"
                >
                  <Text fontSize="xs" color="#555">{prompt}</Text>
                </Box>
              ))}
            </Flex>
          </Box>
        )}

        {/* Input */}
        <Box p={4} borderTop="1px solid #1a1a1a">
          <InputGroup>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask the agent to extract media from any URL..."
              size="lg"
              pr="52px"
              fontSize="sm"
              h="48px"
              isDisabled={loading}
            />
            <InputRightElement h="full" pr={1}>
              <Button
                size="sm"
                bg={input.trim() ? "#ffeb3b" : "#1a1a1a"}
                color={input.trim() ? "black" : "#555"}
                borderRadius="8px"
                w="36px"
                h="36px"
                minW="36px"
                p={0}
                onClick={() => sendMessage()}
                isDisabled={!input.trim() || loading}
                _hover={{ bg: input.trim() ? "#ffff72" : "#1a1a1a" }}
                transition="all 0.2s"
              >
                <Icon as={FiSend} boxSize={3.5} />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Box>
    </VStack>
  );
}
