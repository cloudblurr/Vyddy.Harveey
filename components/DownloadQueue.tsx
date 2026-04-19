"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Progress,
  Switch,
  Text,
  VStack,
  Badge,
  Tooltip,
  useToast,
  FormLabel,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload,
  FiTrash2,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiImage,
  FiVideo,
  FiMusic,
  FiFile,
  FiPackage,
  FiRefreshCw,
} from "react-icons/fi";
import { DownloadItem, MediaType } from "@/types";

const MotionBox = motion(Box);

interface DownloadQueueProps {
  items: DownloadItem[];
  onRemove: (url: string) => void;
  onClear: () => void;
  onUpdate: (url: string, updates: Partial<DownloadItem>) => void;
  onDownloadComplete?: (items: DownloadItem[]) => void;
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

const statusColor: Record<DownloadItem["status"], string> = {
  pending: "#444",
  downloading: "#ffeb3b",
  done: "#4ade80",
  error: "#f87171",
};

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ── AdjectiveAdjectiveAnimal ZIP name generator ────────────────────────────
const ADJECTIVES = [
  "Amber","Arctic","Blazing","Bold","Brave","Bright","Calm","Clever","Cosmic",
  "Crimson","Crystal","Daring","Dark","Dawn","Deep","Divine","Dusty","Electric",
  "Emerald","Epic","Fierce","Fiery","Frosty","Fuzzy","Giant","Gilded","Glowing",
  "Golden","Grand","Gritty","Hidden","Hollow","Icy","Indigo","Iron","Jade",
  "Jolly","Keen","Lazy","Lofty","Lone","Lucky","Lunar","Majestic","Marble",
  "Mighty","Misty","Neon","Noble","Obsidian","Odd","Onyx","Pale","Phantom",
  "Primal","Proud","Quiet","Radiant","Rapid","Rogue","Royal","Ruby","Rustic",
  "Sacred","Savage","Scarlet","Shadow","Sharp","Silent","Silver","Sleek","Sly",
  "Solar","Sonic","Spectral","Stealthy","Steel","Stormy","Strange","Swift",
  "Teal","Thunder","Tiny","Toxic","Turbo","Twilight","Ultra","Velvet","Vibrant",
  "Violet","Vivid","Wild","Windy","Wired","Wise","Witty","Zany","Zealous","Zen",
];

const ANIMALS = [
  "Albatross","Axolotl","Badger","Basilisk","Bear","Bison","Bobcat","Buffalo",
  "Capybara","Caracal","Cheetah","Chimera","Cobra","Condor","Cougar","Coyote",
  "Crane","Crow","Dingo","Dolphin","Dragon","Eagle","Falcon","Ferret","Fox",
  "Gecko","Gorilla","Griffin","Grizzly","Hawk","Hedgehog","Hippo","Hyena",
  "Ibis","Iguana","Jaguar","Kestrel","Komodo","Kraken","Lemur","Leopard",
  "Lynx","Mamba","Manta","Marmot","Mongoose","Moose","Narwhal","Ocelot",
  "Osprey","Otter","Panther","Parrot","Pelican","Phoenix","Puma","Python",
  "Raven","Rhino","Salamander","Scorpion","Serval","Shark","Sloth","Sphinx",
  "Stallion","Stingray","Stoat","Tiger","Titan","Toucan","Viper","Vulture",
  "Walrus","Weasel","Wolf","Wolverine","Wombat","Wyvern","Yak","Zebra",
];

function generateZipName(): string {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const adj1 = pick(ADJECTIVES);
  let adj2 = pick(ADJECTIVES);
  while (adj2 === adj1) adj2 = pick(ADJECTIVES);
  const animal = pick(ANIMALS);
  return `${adj1}${adj2}${animal}.zip`;
}

// Trigger a browser file download from a Blob
function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Small delay before cleanup so the browser has time to start the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }, 300);
}

// Extract filename from Content-Disposition header or fall back to a default
function filenameFromResponse(res: Response, fallback: string): string {
  const cd = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match) {
    const raw = match[1].replace(/['"]/g, "").trim();
    if (raw) return decodeURIComponent(raw);
  }
  return fallback;
}

export default function DownloadQueue({
  items,
  onRemove,
  onClear,
  onUpdate,
  onDownloadComplete,
}: DownloadQueueProps) {
  const [downloading, setDownloading] = useState(false);
  const [saveAsZip, setSaveAsZip] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState<string>("");
  const toast = useToast();

  const pendingItems = items.filter((i) => i.status === "pending");
  const doneItems = items.filter((i) => i.status === "done");
  const errorItems = items.filter((i) => i.status === "error");
  const activeItems = items.filter((i) => i.status === "downloading");

  // ── Download all pending items with progress tracking ──────────────────
  const handleDownloadAll = async () => {
    if (pendingItems.length === 0 || downloading) return;
    setDownloading(true);

    // Optimistically mark as downloading
    pendingItems.forEach((item) =>
      onUpdate(item.url, { status: "downloading", progress: 0 })
    );

    try {
      const useZip = saveAsZip || pendingItems.length > 1;

      // Start the download request
      const startTime = Date.now();
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: pendingItems,
          forceZip: useZip,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      // Stream the response with progress tracking
      const contentLength = res.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      let lastUpdate = Date.now();
      let lastReceived = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          // Update progress and speed
          const now = Date.now();
          const elapsed = (now - lastUpdate) / 1000;
          if (elapsed >= 0.5) {
            // Update every 500ms
            const bytesPerSec = (receivedLength - lastReceived) / elapsed;
            const mbps = (bytesPerSec / (1024 * 1024)).toFixed(2);
            setDownloadSpeed(`${mbps} MB/s`);
            lastUpdate = now;
            lastReceived = receivedLength;

            if (total > 0) {
              const progress = Math.min(Math.round((receivedLength / total) * 100), 99);
              pendingItems.forEach((item) =>
                onUpdate(item.url, { status: "downloading", progress })
              );
            }
          }
        }
      }

      // Combine chunks into blob
      const blob = new Blob(chunks as BlobPart[]);
      const defaultName =
        useZip
          ? generateZipName()
          : (pendingItems[0].filename || "harveey_media");
      const filename = filenameFromResponse(res, defaultName);

      triggerDownload(blob, filename);

      // Mark done
      pendingItems.forEach((item) =>
        onUpdate(item.url, { status: "done", progress: 100 })
      );

      // Notify parent that items are downloaded (so we can mark them as processed in extension queue)
      if (onDownloadComplete) {
        onDownloadComplete(pendingItems);
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      toast({
        title: `${pendingItems.length} file${pendingItems.length !== 1 ? "s" : ""} downloaded in ${elapsed}s`,
        description: filename,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      pendingItems.forEach((item) =>
        onUpdate(item.url, { status: "error", error: msg })
      );
      toast({
        title: "Download failed",
        description: msg,
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setDownloading(false);
      setDownloadSpeed("");
    }
  };

  // ── Download a single item ──────────────────────────────────────────────
  const handleDownloadSingle = async (item: DownloadItem) => {
    onUpdate(item.url, { status: "downloading", progress: 0 });

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [item], forceZip: false }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const filename = filenameFromResponse(res, item.filename || "harveey_media");
      triggerDownload(blob, filename);

      onUpdate(item.url, { status: "done", progress: 100 });
      
      // Notify parent that item is downloaded
      if (onDownloadComplete) {
        onDownloadComplete([item]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      onUpdate(item.url, { status: "error", error: msg });
      toast({
        title: "Download failed",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // ── Empty state ─────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        textAlign="center"
        py={20}
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
          <Icon as={FiDownload} color="#333" boxSize={7} />
        </Box>
        <Text color="#444" fontSize="sm">
          Your download queue is empty
        </Text>
        <Text color="#333" fontSize="xs" mt={1}>
          Extract media from URLs or profiles to add items here
        </Text>
      </MotionBox>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* ── Queue header ── */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        bg="#0d0d0d"
        border="1px solid #1a1a1a"
        borderRadius="16px"
        p={5}
      >
        <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
          {/* Counts */}
          <HStack spacing={3} flexWrap="wrap">
            <Text fontWeight="700" fontSize="lg">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Text>
            {pendingItems.length > 0 && (
              <Badge bg="rgba(85,85,85,0.13)" color="#888" borderRadius="full" px={2} fontSize="xs">
                {pendingItems.length} pending
              </Badge>
            )}
            {activeItems.length > 0 && (
              <Badge bg="rgba(255,235,59,0.13)" color="#ffeb3b" borderRadius="full" px={2} fontSize="xs">
                {activeItems.length} active
              </Badge>
            )}
            {doneItems.length > 0 && (
              <Badge bg="rgba(74,222,128,0.13)" color="#4ade80" borderRadius="full" px={2} fontSize="xs">
                {doneItems.length} done
              </Badge>
            )}
            {errorItems.length > 0 && (
              <Badge bg="rgba(248,113,113,0.13)" color="#f87171" borderRadius="full" px={2} fontSize="xs">
                {errorItems.length} failed
              </Badge>
            )}
          </HStack>

          {/* Actions */}
          <HStack spacing={3} flexWrap="wrap">
            {/* ZIP toggle — only show when there's 1 pending item */}
            {pendingItems.length === 1 && (
              <HStack spacing={2}>
                <Switch
                  id="zip-toggle"
                  size="sm"
                  isChecked={saveAsZip}
                  onChange={(e) => setSaveAsZip(e.target.checked)}
                  colorScheme="yellow"
                  sx={{
                    "span.chakra-switch__track[data-checked]": {
                      bg: "#ffeb3b",
                    },
                  }}
                />
                <FormLabel
                  htmlFor="zip-toggle"
                  mb={0}
                  fontSize="xs"
                  color={saveAsZip ? "#ffeb3b" : "#555"}
                  cursor="pointer"
                  userSelect="none"
                  transition="color 0.2s"
                >
                  Save as ZIP
                </FormLabel>
              </HStack>
            )}

            <Button
              size="sm"
              variant="ghostNeon"
              leftIcon={<Icon as={FiTrash2} />}
              onClick={onClear}
              color="#555"
              _hover={{ color: "#f87171" }}
            >
              Clear All
            </Button>

            {pendingItems.length > 0 && (
              <Button
                variant="neon"
                size="sm"
                leftIcon={
                  <Icon
                    as={
                      pendingItems.length > 1 || saveAsZip
                        ? FiPackage
                        : FiDownload
                    }
                  />
                }
                onClick={handleDownloadAll}
                isLoading={downloading}
                loadingText="Downloading…"
              >
                {pendingItems.length > 1
                  ? `Download All (${pendingItems.length}) as ZIP`
                  : saveAsZip
                  ? "Download as ZIP"
                  : "Download"}
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Progress bar while downloading */}
        {downloading && (
          <Box mt={4}>
            <Flex align="center" justify="space-between" mb={1.5}>
              <Text fontSize="xs" color="#555">
                Fetching files and building archive…
              </Text>
              {downloadSpeed && (
                <Text fontSize="xs" color="#ffeb3b" fontWeight="600">
                  {downloadSpeed}
                </Text>
              )}
            </Flex>
            <Progress
              size="xs"
              isIndeterminate={!downloadSpeed}
              colorScheme="yellow"
              bg="#1a1a1a"
              borderRadius="full"
            />
          </Box>
        )}
      </MotionBox>

      {/* ── Items list ── */}
      <VStack spacing={2} align="stretch">
        <AnimatePresence initial={false}>
          {items.map((item, idx) => {
            const TypeIcon = typeIcon[item.type] ?? FiFile;
            const color = typeColor[item.type] ?? "#9ca3af";

            return (
              <MotionBox
                key={item.url}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                bg="#0d0d0d"
                border="1px solid #1a1a1a"
                borderRadius="12px"
                p={3}
                _hover={{ borderColor: "#2a2a2a" }}
              >
                <Flex align="center" gap={3}>
                  {/* Thumbnail */}
                  <Box
                    w="44px"
                    h="44px"
                    borderRadius="8px"
                    overflow="hidden"
                    flexShrink={0}
                    bg="#111"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.filename}
                        w="full"
                        h="full"
                        objectFit="cover"
                        fallback={
                          <Icon as={TypeIcon} color={color} boxSize={5} />
                        }
                      />
                    ) : (
                      <Icon as={TypeIcon} color={color} boxSize={5} />
                    )}
                  </Box>

                  {/* Info */}
                  <Box flex={1} minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      color="white"
                      noOfLines={1}
                      title={item.filename}
                    >
                      {item.filename}
                    </Text>
                    <HStack spacing={2} mt={0.5}>
                      <Text
                        fontSize="xs"
                        color={color}
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        {item.type}
                      </Text>
                      {item.size && (
                        <Text fontSize="xs" color="#555">
                          {formatSize(item.size)}
                        </Text>
                      )}
                      {item.platform && (
                        <Text fontSize="xs" color="#444">
                          {item.platform}
                        </Text>
                      )}
                    </HStack>

                    {item.status === "downloading" && (
                      <Box mt={1.5}>
                        <Progress
                          value={item.progress || 0}
                          size="xs"
                          colorScheme="yellow"
                          bg="#1a1a1a"
                          borderRadius="full"
                          isIndeterminate={!item.progress || item.progress === 0}
                        />
                        {item.progress && item.progress > 0 && (
                          <Text fontSize="10px" color="#555" mt={0.5}>
                            {item.progress}%
                          </Text>
                        )}
                      </Box>
                    )}

                    {item.status === "error" && item.error && (
                      <Text fontSize="xs" color="#f87171" mt={0.5} noOfLines={1}>
                        {item.error}
                      </Text>
                    )}
                  </Box>

                  {/* Status dot + action buttons */}
                  <HStack spacing={2} flexShrink={0}>
                    <Box
                      w="7px"
                      h="7px"
                      borderRadius="full"
                      bg={statusColor[item.status]}
                      flexShrink={0}
                    />

                    {/* Download single */}
                    {item.status === "pending" && (
                      <Tooltip label="Download this file" hasArrow>
                        <Box
                          as="button"
                          w="28px"
                          h="28px"
                          bg="#111"
                          border="1px solid #1a1a1a"
                          borderRadius="7px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          onClick={() => handleDownloadSingle(item)}
                          _hover={{
                            bg: "#1a1a1a",
                            borderColor: "rgba(255,235,59,0.27)",
                          }}
                          transition="all 0.15s"
                        >
                          <Icon as={FiDownload} color="#666" boxSize={3.5} />
                        </Box>
                      </Tooltip>
                    )}

                    {item.status === "done" && (
                      <Icon as={FiCheck} color="#4ade80" boxSize={4} />
                    )}

                    {/* Retry on error */}
                    {item.status === "error" && (
                      <Tooltip label="Retry" hasArrow>
                        <Box
                          as="button"
                          w="28px"
                          h="28px"
                          bg="#1a0a0a"
                          border="1px solid rgba(248,113,113,0.2)"
                          borderRadius="7px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          onClick={() =>
                            onUpdate(item.url, {
                              status: "pending",
                              error: undefined,
                              progress: undefined,
                            })
                          }
                          _hover={{ bg: "#2a0a0a" }}
                          transition="all 0.15s"
                        >
                          <Icon as={FiRefreshCw} color="#f87171" boxSize={3.5} />
                        </Box>
                      </Tooltip>
                    )}

                    {/* Remove */}
                    <Tooltip label="Remove" hasArrow>
                      <Box
                        as="button"
                        w="28px"
                        h="28px"
                        bg="#111"
                        border="1px solid #1a1a1a"
                        borderRadius="7px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => onRemove(item.url)}
                        _hover={{
                          bg: "#1a0a0a",
                          borderColor: "rgba(248,113,113,0.2)",
                        }}
                        transition="all 0.15s"
                      >
                        <Icon as={FiX} color="#555" boxSize={3.5} />
                      </Box>
                    </Tooltip>
                  </HStack>
                </Flex>
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </VStack>
    </VStack>
  );
}
