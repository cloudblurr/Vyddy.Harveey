export type MediaType = "image" | "video" | "gif" | "audio" | "unknown";

export interface DownloadItem {
  id: string;
  url: string;
  filename: string;
  type: MediaType;
  size?: number;
  thumbnail?: string;
  status: "pending" | "downloading" | "done" | "error";
  progress?: number;
  error?: string;
  sourceUrl?: string;
  platform?: string;
}

export interface ScrapeResult {
  success: boolean;
  items: DownloadItem[];
  error?: string;
  platform?: string;
  totalFound?: number;
}

export interface ProfileMedia {
  id: string;
  url: string;
  thumbnail?: string;
  type: MediaType;
  filename: string;
  caption?: string;
  timestamp?: string;
  selected: boolean;
  platform: string;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mediaItems?: DownloadItem[];
}

export type TabType = "extract" | "profile" | "queue" | "history" | "agent";
