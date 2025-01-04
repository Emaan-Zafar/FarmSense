import React, { useState } from "react";
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';  // Heroicon for send button
import { marked } from 'marked';  // Importing marked for markdown parsing

// Define the Message type
interface Message {
  role: "user" | "system";
  content: string;
}

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]); // Stores chat history
  const [input, setInput] = useState(""); // Input message
  const [isTyping, setIsTyping] = useState(false); // Typing indicator

  // Send message to backend and update chat
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]); // Add user message to chat
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://localhost:4000/api/ai_Suggest/cowChat", { message: input });
      const botMessage: Message = {
        role: "system",
        content: response.data.suggestions,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "system",
        content: "Failed to fetch a response. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle input submission
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

 // Function to parse Markdown into HTML (using concise body)
const parseMarkdown = (text: string) => marked(text);

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "#2e2e2e",
          color: "white",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            padding: 2,
            backgroundColor: "#1c1c1c",
            textAlign: "center",
            boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>Cow Chat Assistant</Typography>
        </Box>

        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 2,
            position: "relative",
          }}
        >
          {/* Background message when no conversation has started */}
          {messages.length === 0 && (
            <Typography
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "rgba(255, 255, 255, 0.5)",
                fontStyle: "italic",
                fontSize: "1.1rem",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              What can I help you with regarding cows today?
            </Typography>
          )}

          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: msg.role === "user" ? "#0b93f6" : "#444654",
                  color: "white",
                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15)`,
                  wordWrap: "break-word",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(msg.content),  // Render parsed HTML here
                }}
              />
            </Box>
          ))}

          {isTyping && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 2,
                alignItems: "center",
                opacity: 0.8,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  padding: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#444654",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15)`,
                }}
              >
                <CircularProgress size={20} sx={{ color: "white", marginRight: 1 }} />
                <Typography variant="body2" sx={{ color: "white" }} >
                  Typing...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Input Box */}
        <Box
          sx={{
            display: "flex",
            padding: 2,
            backgroundColor: "#1c1c1c",
            alignItems: "center",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Message Cow Chat Assistant"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              backgroundColor: "white",
              borderRadius: "20px",  // Rounded border
              input: { color: "black" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                border: "none",  // Remove border
                "&:focus": {
                  border: "none", // Prevent focus border
                  boxShadow: "none", // Remove box shadow when focused
                },
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            sx={{
              marginLeft: 2,
              backgroundColor: "#0b93f6",
              color: "white",
              "&:hover": {
                backgroundColor: "#007acc",
              },
            }}
          >
            <PaperAirplaneIcon style={{ width: 20, height: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ChatPage;
