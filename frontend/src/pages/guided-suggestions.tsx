import { useState } from 'react';
import { Box, Button, Typography, Card, TextField, Grid } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'axios';
import { Scrollbar } from 'src/components/scrollbar';

type Message = {
  sender: string;
  text: string;
  options: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "What issue is your cow experiencing?", options: ["Low productivity", "Health concerns", "Behavioral issues"] },
  ]);
  const [currentStepKey, setCurrentStepKey] = useState<string>("start");
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [input, setInput] = useState<string>("");

  const handleOptionClick = async (option: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: option, options: [] }, // User message with no options
    ]);
    setShowOptions(false); // Hide options after selection
  
    try {
      const { data } = await axios.post("http://localhost:4000/api/ai_Suggest/conversation", {
        currentStepKey,
        userResponse: option,
      });
  
      // If the user selects "No", end the conversation
      if (option.toLowerCase() === "no" && data.end) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Thank you for your time. The conversation has ended.", options: [] },
        ]);
        setCurrentStepKey("start");
        setShowOptions(false); // Hide options when conversation ends
      } else if (data.end) {
        // Handle end of conversation after selecting other options
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.message, options: [] },
        ]);
        setCurrentStepKey("start");
        setShowOptions(false); // Hide options after conversation ends
      } else {
        // Proceed with normal flow if the conversation isn't ended
        const newMessage: Message = {
          sender: "bot",
          text: data.question || data.suggestions?.join("\n") || "",
          options: data.followUpOptions || data.options || [],
        };
  
        if (data.followUpQuestion) {
          newMessage.text += `\n\n${data.followUpQuestion}`;
        }
  
        setMessages((prev) => [...prev, newMessage]);
        setCurrentStepKey(data.stepKey);
        setShowOptions(true); // Show options after receiving a new bot message
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, an error occurred. Please try again.", options: [] },
      ]);
      setShowOptions(false); // Hide options in case of error
    }
  };
  
  

  const sendMessage = async () => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input, options: [] }, // User message
    ]);
    setInput(""); // Clear input
    setShowOptions(false); // Hide options while waiting for response

    try {
      const { data } = await axios.post("http://localhost:4000/api/ai_Suggest/conversation", {
        currentStepKey,
        userResponse: input,
      });

      if (data.end) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.message, options: [] },
        ]);
        setCurrentStepKey("start");
      } else {
        const newMessage: Message = {
          sender: "bot",
          text: data.question || data.suggestions?.join("\n") || "",
          options: data.followUpOptions || data.options || [],
        };

        if (data.followUpQuestion) {
          newMessage.text += `\n\n${data.followUpQuestion}`;
        }

        setMessages((prev) => [...prev, newMessage]);
        setCurrentStepKey(data.stepKey);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, an error occurred. Please try again.", options: [] },
      ]);
    }
  };

  return (
    <DashboardLayout>
      <Card
        sx={{
          backgroundColor: '#7b8687',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          padding: 3,
          margin: 'auto',
          mt: 5,
          width: '80%',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, color: '#fff', textAlign: 'center' }}>
          Chat with AI
        </Typography>
        <Scrollbar sx={{ flex: 1, overflowY: 'auto', padding: 2 }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  padding: 2,
                  borderRadius: '12px',
                  color: '#fff',
                  backgroundColor: msg.sender === "user" ? '#30ac66' : '#f57c00',
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
          {showOptions && (
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
              {messages[messages.length - 1].options?.map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mb: 1,
                    maxWidth: '70%',
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleOptionClick(option)}
                    sx={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#f57c00',
                      color: '#fff',
                      width: 'auto',
                      textAlign: 'center',
                    }}
                  >
                    {option}
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Scrollbar>
        {!showOptions && (
          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item xs={10}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={sendMessage}
                sx={{
                  backgroundColor: '#30ac66',
                  color: 'white',
                  '&:hover': { backgroundColor: '#f57c00' },
                }}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        )}
      </Card>
    </DashboardLayout>
  );
}
