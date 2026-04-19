"use client";

import { Box, Flex, Icon, Image, Text, Tooltip } from "@chakra-ui/react";
import { FiImage, FiVideo, FiMusic, FiFile, FiCheck } from "react-icons/fi";
import { DownloadItem, MediaType } from "@/types";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

interface MediaCardProps {
  item: DownloadItem;
  selected: boolean;
  onToggle: () => void;
}

const typeIcon: Record<MediaType, React.ElementType> = {
  image: FiImage,
  video: FiVideo,
  gif: FiVideo,
  audio: FiMusic,
  unknown: FiFile,
};

const typeColor: Record<MediaType, string> = {
  image: "#60a5fa",
  video: "#f472b6",
  gif: "#a78bfa",
  audio: "#34d399",
  unknown: "#9ca3af",
};

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function MediaCard({ item, selected, onToggle }: MediaCardProps) {
  const TypeIcon = typeIcon[item.type] || FiFile;
  const color = typeColor[item.type] || "#9ca3af";

  return (
    <Tooltip label={item.filename} placement="top" hasArrow openDelay={500}>
      <MotionBox
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        cursor="pointer"
        position="relative"
        borderRadius="10px"
        overflow="hidden"
        border={selected ? "2px solid #ffeb3b" : "2px solid #1a1a1a"}
        bg="#0d0d0d"
        transition="border-color 0.15s"
        style={{
          boxShadow: selected ? "0 0 12px rgba(255,235,59,0.2)" : "none",
        }}
        aspectRatio="1"
      >
        {/* Thumbnail or placeholder */}
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.filename}
            w="full"
            h="full"
            objectFit="cover"
            fallback={
              <Flex
                w="full"
                h="full"
                align="center"
                justify="center"
                bg="#111"
                minH="100px"
              >
                <Icon as={TypeIcon} color={color} boxSize={8} opacity={0.5} />
              </Flex>
            }
          />
        ) : (
          <Flex
            w="full"
            h="full"
            align="center"
            justify="center"
            bg="#111"
            minH="100px"
            direction="column"
            gap={2}
          >
            <Icon as={TypeIcon} color={color} boxSize={8} opacity={0.6} />
          </Flex>
        )}

        {/* Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg={selected ? "rgba(255,235,59,0.08)" : "transparent"}
          transition="background 0.15s"
        />

        {/* Type badge */}
        <Box
          position="absolute"
          top={1.5}
          left={1.5}
          bg="rgba(0,0,0,0.75)"
          backdropFilter="blur(4px)"
          borderRadius="5px"
          px={1.5}
          py={0.5}
        >
          <Text fontSize="9px" color={color} fontWeight="700" textTransform="uppercase">
            {item.type}
          </Text>
        </Box>

        {/* Size badge */}
        {item.size && (
          <Box
            position="absolute"
            bottom={1.5}
            left={1.5}
            bg="rgba(0,0,0,0.75)"
            backdropFilter="blur(4px)"
            borderRadius="5px"
            px={1.5}
            py={0.5}
          >
            <Text fontSize="9px" color="#888" fontWeight="500">
              {formatSize(item.size)}
            </Text>
          </Box>
        )}

        {/* Checkmark */}
        <Box
          position="absolute"
          top={1.5}
          right={1.5}
          w="20px"
          h="20px"
          bg={selected ? "#ffeb3b" : "rgba(0,0,0,0.6)"}
          border={selected ? "none" : "1.5px solid #333"}
          borderRadius="5px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="all 0.15s"
        >
          {selected && <Icon as={FiCheck} color="black" boxSize={3} strokeWidth={3} />}
        </Box>
      </MotionBox>
    </Tooltip>
  );
}
