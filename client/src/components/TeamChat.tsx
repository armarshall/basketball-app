import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Message {
  _id: string;
  teamId: string;
  senderId: string;
  senderType: string;
  content: string;
  senderName: string;
  timestamp: string;
}

interface TeamChatProps {
  teamId: string;
  userId: string;
  userType: string;
}

export default function TeamChat({ teamId, userId, userType }: TeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from the server
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/teams/${teamId}/messages`,
        {
          params: { userId, userType },
        }
      );
      setMessages(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      if (err?.response?.status !== 403) {
        setError("Error loading messages");
      }
    }
  };

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/api/teams/${teamId}/messages`, {
        userId,
        userType,
        content: newMessage.trim(),
      });
      setNewMessage("");
      await fetchMessages();
      scrollToBottom();
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(err?.response?.data?.error || "Error sending message");
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  // Set up polling for new messages
  useEffect(() => {
    fetchMessages();

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [teamId, userId, userType]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return (
      <div style={{ padding: 20, color: "#dc3545" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 20,
        marginBottom: 30,
      }}
    >
      <h3>Team Chat</h3>

      {/* Messages Display */}
      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          padding: 10,
          marginBottom: 15,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#999",
            }}
          >
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === userId;
              return (
                <div
                  key={message._id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isOwnMessage ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "10px 15px",
                      borderRadius: 8,
                      backgroundColor: isOwnMessage ? "#007bff" : "#fff",
                      color: isOwnMessage ? "#fff" : "#333",
                      border: isOwnMessage ? "none" : "1px solid #ddd",
                    }}
                  >
                    {!isOwnMessage && (
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: 12,
                          marginBottom: 5,
                          color: "#666",
                        }}
                      >
                        {message.senderName}
                      </div>
                    )}
                    <div style={{ wordBreak: "break-word" }}>
                      {message.content}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 5,
                        opacity: 0.7,
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px 15px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: 14,
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor:
              loading || !newMessage.trim() ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading || !newMessage.trim() ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
