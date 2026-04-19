"use client";

import { Box, Flex, HStack, Text, Badge, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiDownload, FiZap } from "react-icons/fi";

const MotionBox = motion(Box);
const MotionText = motion(Text);

interface HeaderProps {
  queueCount: number;
  extensionQueueCount?: number;
}

export default function Header({ queueCount, extensionQueueCount = 0 }: HeaderProps) {
  return (
    <Box pt={8} pb={6}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
        {/* Logo */}
        <HStack spacing={3} align="center">
          <MotionBox
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Box
              w="44px"
              h="44px"
              bg="#ffeb3b"
              borderRadius="10px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              className="neon-glow"
            >
              <Icon as={FiZap} color="black" boxSize={5} strokeWidth={2.5} />
            </Box>
          </MotionBox>

          <Box>
            <MotionText
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              fontSize="2xl"
              fontWeight="900"
              letterSpacing="-0.04em"
              lineHeight={1}
              color="white"
            >
              HARVEEY VYDDY
            </MotionText>
            <MotionText
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              fontSize="xs"
              color="#555"
              letterSpacing="0.15em"
              textTransform="uppercase"
              fontWeight="500"
            >
              AI Media Extractor
            </MotionText>
          </Box>
        </HStack>

        {/* Status indicators */}
        <HStack spacing={3}>
          {extensionQueueCount > 0 && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <HStack
                spacing={2}
                px={3}
                py={1.5}
                bg="#111"
                border="1px solid #4ade8033"
                borderRadius="full"
              >
                <Icon as={FiZap} color="#4ade80" boxSize={3.5} />
                <Text fontSize="xs" color="#4ade80" fontWeight="600">
                  {extensionQueueCount} from extension
                </Text>
              </HStack>
            </MotionBox>
          )}
          
          {queueCount > 0 && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <HStack
                spacing={2}
                px={3}
                py={1.5}
                bg="#111"
                border="1px solid #ffeb3b33"
                borderRadius="full"
              >
                <Icon as={FiDownload} color="#ffeb3b" boxSize={3.5} />
                <Text fontSize="xs" color="#ffeb3b" fontWeight="600">
                  {queueCount} queued
                </Text>
              </HStack>
            </MotionBox>
          )}

          <HStack
            spacing={2}
            px={3}
            py={1.5}
            bg="#111"
            border="1px solid #1a1a1a"
            borderRadius="full"
          >
            <Box w={2} h={2} bg="#4ade80" borderRadius="full" className="neon-pulse" />
            <Text fontSize="xs" color="#666" fontWeight="500">
              Agent Online
            </Text>
          </HStack>
        </HStack>
      </Flex>

      {/* Tagline */}
      <MotionText
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        mt={4}
        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
        fontWeight="800"
        letterSpacing="-0.03em"
        lineHeight={1.1}
        maxW="700px"
      >
        Harvest media from{" "}
        <Text as="span" color="#ffeb3b">
          any URL
        </Text>
        , anywhere.
      </MotionText>
      <MotionText
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        mt={2}
        fontSize="sm"
        color="#555"
        maxW="500px"
      >
        AI-powered scraping for images, videos, and media from adult sites, social platforms, and any URL with embedded content.
      </MotionText>
    </Box>
  );
}
