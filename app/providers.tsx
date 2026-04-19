"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#ffff72",
      100: "#ffff5e",
      200: "#ffff3b",
      300: "#ffeb3b",
      400: "#fdd835",
      500: "#fbc02d",
      600: "#f9a825",
      700: "#f57f17",
      800: "#e65100",
      900: "#bf360c",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#050505",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      "*": {
        boxSizing: "border-box",
      },
      "::-webkit-scrollbar": {
        width: "6px",
        height: "6px",
      },
      "::-webkit-scrollbar-track": {
        bg: "#111111",
      },
      "::-webkit-scrollbar-thumb": {
        bg: "rgba(255,235,59,0.27)",
        borderRadius: "3px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        bg: "rgba(255,235,59,0.53)",
      },
    },
  },
  components: {
    Button: {
      variants: {
        neon: {
          bg: "#ffeb3b",
          color: "#000",
          fontWeight: "700",
          _hover: {
            bg: "#ffff72",
            boxShadow: "0 0 20px rgba(255,235,59,0.5)",
            transform: "translateY(-1px)",
          },
          _active: {
            bg: "#fdd835",
            transform: "translateY(0)",
          },
          transition: "all 0.2s",
        },
        ghostNeon: {
          bg: "transparent",
          color: "#ffeb3b",
          border: "1px solid rgba(255,235,59,0.27)",
          _hover: {
            bg: "rgba(255,235,59,0.07)",
            border: "1px solid #ffeb3b",
          },
          transition: "all 0.2s",
        },
      },
    },
    Input: {
      variants: {
        neon: {
          field: {
            bg: "#111111",
            border: "1px solid #1a1a1a",
            color: "white",
            _hover: { border: "1px solid rgba(255,235,59,0.27)" },
            _focus: {
              border: "1px solid #ffeb3b",
              boxShadow: "0 0 0 1px rgba(255,235,59,0.27)",
            },
            _placeholder: { color: "#555" },
          },
        },
      },
      defaultProps: { variant: "neon" },
    },
    Textarea: {
      variants: {
        neon: {
          bg: "#111111",
          border: "1px solid #1a1a1a",
          color: "white",
          _hover: { border: "1px solid rgba(255,235,59,0.27)" },
          _focus: {
            border: "1px solid #ffeb3b",
            boxShadow: "0 0 0 1px rgba(255,235,59,0.27)",
          },
          _placeholder: { color: "#555" },
        },
      },
      defaultProps: { variant: "neon" },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
