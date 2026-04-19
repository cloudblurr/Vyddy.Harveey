"use client";

import { useState, useEffect, useRef } from "react";
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
  InputLeftElement,
  InputRightElement,
  Progress,
  Spinner,
  Text,
  VStack,
  Checkbox,
  Badge,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLink,
  FiSearch,
  FiDownload,
  FiImage,
  FiVideo,
  FiFile,
  FiCheckSquare,
  FiSquare,
  FiX,
  FiAlertCircle,
  FiZap,
  FiPlus,
} from "react-icons/fi";
import { DownloadItem, ScrapeResult } from "@/types";
import MediaCard from "./MediaCard";

const MotionBox = motion(Box);

interface UrlExtractorProps {
  onAddToQueue: (items: DownloadItem[]) => void;
  seedUrl?: string;
  onSeedConsumed?: () => void;
}

const PLATFORM_EXAMPLES = [
  "xvideos.com", "xhamster.com", "redgifs.com", "erome.com",
  "instagram.com", "twitter.com", "facebook.com", "reddit.com",
];

export default function UrlExtractor({ onAddToQueue, seedUrl, onSeedConsumed }: UrlExtractorProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DownloadItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const toast = useToast();

  // When a seed URL arrives from ProfileBrowser, load it and auto-scrape
  const prevSeedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (seedUrl && seedUrl !== prevSeedRef.current) {
      prevSeedRef.current = seedUrl;
      setUrl(seedUrl);
      onSeedConsumed?.();
      // Kick off scrape after state settles
      setTimeout(() => triggerScrape(seedUrl), 50);
    }
  }, [seedUrl]);

  const triggerScrape = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(new Set());
    setPlatform(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data: ScrapeResult = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to extract media from this URL.");
        return;
      }

      setResults(data.items);
      setPlatform(data.platform || null);

      if (data.items.length === 0) {
        setError("No media found at this URL. Try a different link.");
      } else {
        setSelected(new Set(data.items.map((i) => i.url)));
        toast({
          title: `Found ${data.items.length} media item${data.items.length !== 1 ? "s" : ""}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = () => triggerScrape(url);

  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(results.map((i) => i.url)));
  const selectNone = () => setSelected(new Set());

  const handleAddSelected = () => {
    const items = results.filter((i) => selected.has(i.url));
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

  const imageCount = results.filter((i) => i.type === "image").length;
  const videoCount = results.filter((i) => i.type === "video" || i.type === "gif").length;

  return (
    <VStack spacing={6} align="stretch">
      {/* URL Input */}
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        p={6}
      >
        <Text fontSize="xs" color="#555" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase" mb={4}>
          Enter URL to Extract
        </Text>

        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <Icon as={FiLink} color="#555" boxSize={4} />
            </InputLeftElement>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
              placeholder="https://example.com/media-page"
              size="lg"
              pl={10}
              fontSize="sm"
              h="48px"
            />
            {url && (
              <InputRightElement h="full" pr={1}>
                <Icon
                  as={FiX}
                  color="#555"
                  boxSize={4}
                  cursor="pointer"
                  onClick={() => setUrl("")}
                  _hover={{ color: "white" }}
                />
              </InputRightElement>
            )}
          </InputGroup>

          <Button
            variant="neon"
            size="lg"
            h="48px"
            px={8}
            onClick={handleScrape}
            isLoading={loading}
            loadingText="Scanning..."
            leftIcon={<Icon as={FiZap} />}
            flexShrink={0}
          >
            Extract
          </Button>
        </Flex>

        {/* Platform chips */}
        <Flex mt={4} gap={2} flexWrap="wrap">
          <Text fontSize="xs" color="#444" mr={1} alignSelf="center">Supports:</Text>
          {PLATFORM_EXAMPLES.map((p) => (
            <Box
              key={p}
              px={2}
              py={0.5}
              bg="#111"
              border="1px solid #1a1a1a"
              borderRadius="full"
              cursor="pointer"
              onClick={() => setUrl(`https://${p}`)}
              _hover={{ border: "1px solid #ffeb3b44", color: "#ffeb3b" }}
              transition="all 0.15s"
            >
              <Text fontSize="10px" color="#555" fontWeight="500">{p}</Text>
            </Box>
          ))}
        </Flex>
      </MotionBox>

      {/* Loading state */}
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
                <Text color="#888" fontSize="sm">AI agent scanning URL for media...</Text>
              </HStack>
              <Box w="full" maxW="400px">
                <Progress
                  size="xs"
                  isIndeterminate
                  colorScheme="yellow"
                  bg="#1a1a1a"
                  borderRadius="full"
                />
              </Box>
              <Text fontSize="xs" color="#444">Extracting images, videos, and embedded content</Text>
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Error state */}
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

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Results header */}
            <Flex
              align="center"
              justify="space-between"
              mb={4}
              flexWrap="wrap"
              gap={3}
            >
              <HStack spacing={4}>
                <Text fontWeight="700" fontSize="lg">
                  {results.length} items found
                </Text>
                {platform && (
                  <Badge
                    bg="#ffeb3b22"
                    color="#ffeb3b"
                    border="1px solid #ffeb3b33"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="600"
                  >
                    {platform}
                  </Badge>
                )}
                {imageCount > 0 && (
                  <HStack spacing={1}>
                    <Icon as={FiImage} color="#888" boxSize={3.5} />
                    <Text fontSize="xs" color="#666">{imageCount}</Text>
                  </HStack>
                )}
                {videoCount > 0 && (
                  <HStack spacing={1}>
                    <Icon as={FiVideo} color="#888" boxSize={3.5} />
                    <Text fontSize="xs" color="#666">{videoCount}</Text>
                  </HStack>
                )}
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="ghostNeon"
                  onClick={selected.size === results.length ? selectNone : selectAll}
                  leftIcon={<Icon as={selected.size === results.length ? FiCheckSquare : FiSquare} />}
                >
                  {selected.size === results.length ? "Deselect All" : "Select All"}
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

            {/* Media grid */}
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
              {results.map((item, idx) => (
                <MotionBox
                  key={item.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                >
                  <MediaCard
                    item={item}
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
      {!loading && results.length === 0 && !error && (
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
            <Icon as={FiSearch} color="#333" boxSize={7} />
          </Box>
          <Text color="#444" fontSize="sm">
            Enter a URL above to start extracting media
          </Text>
          <Text color="#333" fontSize="xs" mt={1}>
            Supports images, videos, GIFs, and embedded content
          </Text>
        </MotionBox>
      )}
    </VStack>
  );
}
