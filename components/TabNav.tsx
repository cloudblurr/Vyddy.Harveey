"use client";

import { Box, Flex, HStack, Text, Badge } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiLink, FiUser, FiDownload, FiCpu, FiClock } from "react-icons/fi";
import { TabType } from "@/types";

const MotionBox = motion(Box);

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  queueCount: number;
}

export default function TabNav({ activeTab, onTabChange, queueCount }: TabNavProps) {
  const tabs: Tab[] = [
    { id: "extract", label: "URL Extract", icon: FiLink },
    { id: "profile", label: "Profile Browser", icon: FiUser },
    { id: "queue", label: "Downloads", icon: FiDownload, badge: queueCount || undefined },
    { id: "history", label: "History", icon: FiClock },
    { id: "agent", label: "AI Agent", icon: FiCpu },
  ];

  return (
    <Box mb={6}>
      <Flex
        gap={1}
        p={1}
        bg="#0a0a0a"
        border="1px solid #1a1a1a"
        borderRadius="12px"
        display="inline-flex"
        flexWrap="wrap"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Box
              key={tab.id}
              position="relative"
              onClick={() => onTabChange(tab.id)}
              cursor="pointer"
            >
              {isActive && (
                <MotionBox
                  layoutId="tab-indicator"
                  position="absolute"
                  inset={0}
                  bg="#ffeb3b"
                  borderRadius="9px"
                  zIndex={0}
                  style={{ boxShadow: "0 0 15px rgba(255,235,59,0.3)" }}
                />
              )}
              <HStack
                spacing={2}
                px={4}
                py={2.5}
                position="relative"
                zIndex={1}
                borderRadius="9px"
                transition="all 0.2s"
                _hover={!isActive ? { bg: "#ffffff08" } : {}}
              >
                <Icon
                  size={15}
                  color={isActive ? "#000" : "#666"}
                  style={{ transition: "color 0.2s" }}
                />
                <Text
                  fontSize="sm"
                  fontWeight={isActive ? "700" : "500"}
                  color={isActive ? "#000" : "#666"}
                  transition="color 0.2s"
                  whiteSpace="nowrap"
                >
                  {tab.label}
                </Text>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Box
                    bg={isActive ? "#000" : "#ffeb3b"}
                    color={isActive ? "#ffeb3b" : "#000"}
                    borderRadius="full"
                    px={1.5}
                    py={0.5}
                    minW="18px"
                    textAlign="center"
                  >
                    <Text fontSize="10px" fontWeight="800" lineHeight={1.4}>
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </Text>
                  </Box>
                )}
              </HStack>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
