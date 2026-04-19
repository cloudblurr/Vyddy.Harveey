"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
  Badge,
  useToast,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiExternalLink,
  FiImage,
  FiVideo,
  FiFile,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { DownloadItem } from "@/types";

const MotionBox = motion(Box);

interface HistoryItem extends Omit<DownloadItem, 'status'> {
  timestamp: number;
  source?: string;
  status: string;
}

export default function DownloadHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (platformFilter) params.set("platform", platformFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();

      if (data.success) {
        setHistory(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [platformFilter, sourceFilter]);

  const clearHistory = async () => {
    try {
      const res = await fetch("/api/history?all=true", { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setHistory([]);
        toast({
          title: "History cleared",
          status: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to clear history",
        status: "error",
        duration: 2000,
      });
    }
    onClose();
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const filteredHistory = history.filter(item => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        item.filename.toLowerCase().includes(searchLower) ||
        item.url.toLowerCase().includes(searchLower) ||
        item.platform?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return FiImage;
      case "video": return FiVideo;
      case "gif": return FiVideo;
      default: return FiFile;
    }
  };

  const uniquePlatforms = [...new Set(history.map(item => item.platform).filter(Boolean))];

  return (
    <VStack spacing={5} align="stretch">
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        p={5}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Icon as={FiClock} color="#ffeb3b" boxSize={5} />
            <Text fontWeight="700" fontSize="lg">Download History</Text>
            <Badge bg="#1a1a1a" color="#666" borderRadius="full" px={2}>
              {history.length} items
            </Badge>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label="Refresh">
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Icon as={FiRefreshCw} />}
                onClick={fetchHistory}
                aria-label="Refresh"
              />
            </Tooltip>
            <Tooltip label="Clear All">
              <IconButton
                size="sm"
                variant="ghost"
                color="red.400"
                icon={<Icon as={FiTrash2} />}
                onClick={onOpen}
                aria-label="Clear history"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Filters */}
        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <Icon as={FiSearch} color="#555" boxSize={4} />
            </InputLeftElement>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename, URL, or platform..."
              size="md"
              h="40px"
              pl={10}
              fontSize="sm"
            />
          </InputGroup>

          <Select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            placeholder="All Platforms"
            size="md"
            h="40px"
            w="150px"
          >
            {uniquePlatforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            placeholder="All Sources"
            size="md"
            h="40px"
            w="150px"
          >
            <option value="app">Main App</option>
            <option value="extension">Extension</option>
          </Select>

          <HStack spacing={1}>
            <IconButton
              size="sm"
              variant={viewMode === "grid" ? "solid" : "ghost"}
              colorScheme={viewMode === "grid" ? "yellow" : undefined}
              icon={<Icon as={FiGrid} />}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            />
            <IconButton
              size="sm"
              variant={viewMode === "list" ? "solid" : "ghost"}
              colorScheme={viewMode === "list" ? "yellow" : undefined}
              icon={<Icon as={FiList} />}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            />
          </HStack>
        </Flex>
      </MotionBox>

      {/* Loading */}
      {loading && (
        <Flex justify="center" py={12}>
          <VStack spacing={3}>
            <Spinner color="#ffeb3b" />
            <Text color="#666" fontSize="sm">Loading history...</Text>
          </VStack>
        </Flex>
      )}

      {/* Empty State */}
      {!loading && filteredHistory.length === 0 && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
            <Icon as={FiClock} color="#333" boxSize={7} />
          </Box>
          <Text color="#444" fontSize="sm">No download history yet</Text>
          <Text color="#333" fontSize="xs" mt={1}>
            Downloads from the app and extension will appear here
          </Text>
        </MotionBox>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && filteredHistory.length > 0 && (
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
          <AnimatePresence>
            {filteredHistory.map((item, idx) => (
              <MotionBox
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Box
                  bg="#0d0d0d"
                  border="1px solid #1a1a1a"
                  borderRadius="12px"
                  overflow="hidden"
                  position="relative"
                  _hover={{ borderColor: "#2a2a2a" }}
                  transition="all 0.2s"
                >
                  {/* Thumbnail */}
                  <Box
                    h="120px"
                    bg="#111"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt=""
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        fallback={
                          <Icon as={getTypeIcon(item.type)} color="#333" boxSize={8} />
                        }
                      />
                    ) : (
                      <Icon as={getTypeIcon(item.type)} color="#333" boxSize={8} />
                    )}

                    {/* Type badge */}
                    <Badge
                      position="absolute"
                      top={2}
                      left={2}
                      bg="#00000088"
                      color="#ffeb3b"
                      fontSize="9px"
                      borderRadius="4px"
                      px={1.5}
                    >
                      {item.type}
                    </Badge>

                    {/* Source badge */}
                    {item.source === "extension" && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        bg="#4caf5022"
                        color="#4caf50"
                        fontSize="9px"
                        borderRadius="4px"
                        px={1.5}
                      >
                        EXT
                      </Badge>
                    )}
                  </Box>

                  {/* Info */}
                  <Box p={2}>
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="#e0e0e0"
                      isTruncated
                      title={item.filename}
                    >
                      {item.filename}
                    </Text>
                    <HStack spacing={2} mt={1}>
                      {item.platform && (
                        <Text fontSize="9px" color="#666">
                          {item.platform}
                        </Text>
                      )}
                      <Text fontSize="9px" color="#444">
                        {formatTimeAgo(item.timestamp)}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Actions overlay */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="#00000088"
                    opacity={0}
                    _hover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    <Tooltip label="Open URL">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        color="white"
                        icon={<Icon as={FiExternalLink} />}
                        onClick={() => window.open(item.url, "_blank")}
                        aria-label="Open URL"
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        color="red.400"
                        icon={<Icon as={FiTrash2} />}
                        onClick={() => deleteItem(item.id)}
                        aria-label="Delete"
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && filteredHistory.length > 0 && (
        <VStack spacing={2} align="stretch">
          <AnimatePresence>
            {filteredHistory.map((item, idx) => (
              <MotionBox
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Flex
                  bg="#0d0d0d"
                  border="1px solid #1a1a1a"
                  borderRadius="10px"
                  p={3}
                  align="center"
                  gap={3}
                  _hover={{ borderColor: "#2a2a2a" }}
                  transition="all 0.2s"
                >
                  {/* Thumbnail */}
                  <Box
                    w="48px"
                    h="48px"
                    bg="#111"
                    borderRadius="6px"
                    overflow="hidden"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt=""
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        fallback={
                          <Icon as={getTypeIcon(item.type)} color="#333" boxSize={5} />
                        }
                      />
                    ) : (
                      <Icon as={getTypeIcon(item.type)} color="#333" boxSize={5} />
                    )}
                  </Box>

                  {/* Info */}
                  <Box flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight="600" color="#e0e0e0" isTruncated>
                      {item.filename}
                    </Text>
                    <HStack spacing={3} mt={0.5}>
                      <Badge
                        bg="#ffeb3b22"
                        color="#ffeb3b"
                        fontSize="9px"
                        borderRadius="4px"
                      >
                        {item.type}
                      </Badge>
                      {item.platform && (
                        <Text fontSize="10px" color="#666">
                          {item.platform}
                        </Text>
                      )}
                      <Text fontSize="10px" color="#444">
                        {formatDate(item.timestamp)}
                      </Text>
                      {item.source === "extension" && (
                        <Badge bg="#4caf5022" color="#4caf50" fontSize="9px" borderRadius="4px">
                          Extension
                        </Badge>
                      )}
                    </HStack>
                  </Box>

                  {/* Status */}
                  <Icon
                    as={item.status === "completed" ? FiCheckCircle : FiXCircle}
                    color={item.status === "completed" ? "#4caf50" : "#f44336"}
                    boxSize={4}
                  />

                  {/* Actions */}
                  <HStack spacing={1}>
                    <Tooltip label="Open URL">
                      <IconButton
                        size="xs"
                        variant="ghost"
                        color="#666"
                        icon={<Icon as={FiExternalLink} />}
                        onClick={() => window.open(item.url, "_blank")}
                        aria-label="Open URL"
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        size="xs"
                        variant="ghost"
                        color="#666"
                        icon={<Icon as={FiTrash2} />}
                        onClick={() => deleteItem(item.id)}
                        aria-label="Delete"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </MotionBox>
            ))}
          </AnimatePresence>
        </VStack>
      )}

      {/* Clear History Dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={undefined as any} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent bg="#0d0d0d" border="1px solid #1a1a1a">
            <AlertDialogHeader color="#e0e0e0">Clear Download History</AlertDialogHeader>
            <AlertDialogBody color="#888">
              Are you sure you want to clear all download history? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" onClick={clearHistory} ml={3}>
                Clear All
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
