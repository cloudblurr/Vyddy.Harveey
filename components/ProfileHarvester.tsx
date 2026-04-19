"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  Progress,
  Select,
  Spinner,
  Text,
  VStack,
  Badge,
  useToast,
  Avatar,
  Divider,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAtSign,
  FiDownload,
  FiImage,
  FiVideo,
  FiCheckSquare,
  FiSquare,
  FiZap,
  FiUser,
  FiAlertCircle,
  FiPlus,
  FiTwitter,
  FiInstagram,
} from "react-icons/fi";
import { DownloadItem, ProfileMedia } from "@/types";
import MediaCard from "./MediaCard";

const MotionBox = motion(Box);

interface ProfileHarvesterProps {
  onAddToQueue: (items: DownloadItem[]) => void;
}

type Platform = "twitter" | "instagram";

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: React.ElementType; placeholder: string }> = {
  twitter: {
    label: "Twitter / X",
    color: "#1d9bf0",
    icon: FiTwitter,
    placeholder: "username",
  },
  instagram: {
    label: "Instagram",
    color: "#e1306c",
    icon: FiInstagram,
    placeholder: "username",
  },
};

export default function ProfileHarvester({ onAddToQueue }: ProfileHarvesterProps) {
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<ProfileMedia[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<{ name: string; avatar?: string; count: number } | null>(null);
  const toast = useToast();

  const config = PLATFORM_CONFIG[platform];

  const handleFetch = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setError(null);
    setMedia([]);
    setSelected(new Set());
    setProfileInfo(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: handle.trim().replace(/^@/, "") }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to fetch profile media.");
        return;
      }

      setMedia(data.items);
      setProfileInfo(data.profile || null);

      if (data.items.length === 0) {
        setError("No media found for this profile.");
      } else {
        setSelected(new Set(data.items.map((i: ProfileMedia) => i.url)));
        toast({
          title: `Loaded ${data.items.length} media items`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(media.map((i) => i.url)));
  const selectNone = () => setSelected(new Set());

  const handleAddSelected = () => {
    const items = media
      .filter((i) => selected.has(i.url))
      .map((i): DownloadItem => ({
        id: i.id,
        url: i.url,
        filename: i.filename,
        type: i.type,
        thumbnail: i.thumbnail,
        status: "pending",
        platform: i.platform,
      }));

    if (items.length === 0) return;
    onAddToQueue(items);
    toast({
      title: `${items.length} item${items.length !== 1 ? "s" : ""} added to queue`,
      description: "Go to Downloads tab to start downloading.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Input panel */}
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        p={6}
      >
        <Text fontSize="xs" color="#555" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase" mb={4}>
          Profile Media Harvest
        </Text>

        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          {/* Platform selector */}
          <Flex gap={2}>
            {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((p) => {
              const cfg = PLATFORM_CONFIG[p];
              const PIcon = cfg.icon;
              const isActive = platform === p;
              return (
                <Button
                  key={p}
                  size="lg"
                  h="48px"
                  px={4}
                  bg={isActive ? "#ffeb3b" : "#111"}
                  color={isActive ? "#000" : "#666"}
                  border={isActive ? "none" : "1px solid #1a1a1a"}
                  borderRadius="10px"
                  onClick={() => setPlatform(p)}
                  leftIcon={<Icon as={PIcon} />}
                  fontWeight={isActive ? "700" : "500"}
                  _hover={{ bg: isActive ? "#ffff72" : "#1a1a1a" }}
                  transition="all 0.2s"
                  flexShrink={0}
                >
                  {cfg.label}
                </Button>
              );
            })}
          </Flex>

          {/* Handle input */}
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <Icon as={FiAtSign} color="#555" boxSize={4} />
            </InputLeftElement>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              placeholder={config.placeholder}
              size="lg"
              pl={10}
              fontSize="sm"
              h="48px"
            />
          </InputGroup>

          <Button
            variant="neon"
            size="lg"
            h="48px"
            px={8}
            onClick={handleFetch}
            isLoading={loading}
            loadingText="Fetching..."
            leftIcon={<Icon as={FiZap} />}
            flexShrink={0}
          >
            Harvest
          </Button>
        </Flex>

        <Text mt={3} fontSize="xs" color="#444">
          Enter a username to browse and download all their posted media. Multi-select supported.
          <Text as="span" color="#ffeb3b" ml={1}>Note:</Text> Instagram and Twitter have restricted API access.
          Use the URL Extract tab for direct post URLs instead.
        </Text>
      </MotionBox>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            bg="#0d0d0d"
            border="1px solid #1a1a1a"
            borderRadius="16px"
            p={8}
          >
            <VStack spacing={4}>
              <HStack spacing={3}>
                <Spinner color="#ffeb3b" size="sm" />
                <Text color="#888" fontSize="sm">Fetching profile media from {config.label}...</Text>
              </HStack>
              <Progress size="xs" isIndeterminate colorScheme="yellow" bg="#1a1a1a" borderRadius="full" w="full" maxW="400px" />
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            bg="#1a0a0a"
            border="1px solid #ff444433"
            borderRadius="16px"
            p={5}
          >
            <HStack spacing={3}>
              <Icon as={FiAlertCircle} color="#ff4444" boxSize={5} />
              <Text color="#ff8888" fontSize="sm">{error}</Text>
            </HStack>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Profile info + results */}
      <AnimatePresence>
        {media.length > 0 && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Profile header */}
            {profileInfo && (
              <Box
                bg="#0d0d0d"
                border="1px solid #1a1a1a"
                borderRadius="16px"
                p={4}
                mb={4}
              >
                <HStack spacing={4}>
                  <Avatar
                    name={profileInfo.name}
                    src={profileInfo.avatar}
                    size="md"
                    bg="#ffeb3b"
                    color="black"
                  />
                  <Box>
                    <Text fontWeight="700" fontSize="md">{profileInfo.name}</Text>
                    <Text fontSize="xs" color="#555">@{handle} · {profileInfo.count} media items</Text>
                  </Box>
                  <Badge
                    ml="auto"
                    bg="#ffeb3b22"
                    color="#ffeb3b"
                    border="1px solid #ffeb3b33"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="xs"
                  >
                    {config.label}
                  </Badge>
                </HStack>
              </Box>
            )}

            {/* Controls */}
            <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={3}>
              <Text fontWeight="700" fontSize="lg">
                {media.length} items · {selected.size} selected
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="ghostNeon"
                  onClick={selected.size === media.length ? selectNone : selectAll}
                  leftIcon={<Icon as={selected.size === media.length ? FiCheckSquare : FiSquare} />}
                >
                  {selected.size === media.length ? "Deselect All" : "Select All"}
                </Button>
                <Button
                  variant="neon"
                  size="sm"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={handleAddSelected}
                  isDisabled={selected.size === 0}
                >
                  Add {selected.size > 0 ? `(${selected.size})` : ""} to Queue
                </Button>
              </HStack>
            </Flex>

            {/* Grid */}
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
                xl: "repeat(6, 1fr)",
              }}
              gap={3}
            >
              {media.map((item, idx) => (
                <MotionBox
                  key={item.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02, duration: 0.2 }}
                >
                  <MediaCard
                    item={{ ...item, status: "pending" }}
                    selected={selected.has(item.url)}
                    onToggle={() => toggleSelect(item.url)}
                  />
                </MotionBox>
              ))}
            </Grid>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && media.length === 0 && !error && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          textAlign="center"
          py={16}
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
            <Icon as={FiUser} color="#333" boxSize={7} />
          </Box>
          <Text color="#444" fontSize="sm">Enter a username to harvest their media</Text>
          <Text color="#333" fontSize="xs" mt={1}>Note: Platform APIs are often restricted</Text>
          <Text color="#555" fontSize="xs" mt={1}>Use URL Extract tab for direct post URLs</Text>
        </MotionBox>
      )}
    </VStack>
  );
}
