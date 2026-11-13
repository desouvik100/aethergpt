import Message from "./components/Message";
import { useState, useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";
import "./App.css";

import {
  Plus,
  MessageSquare,
  Send,
  PanelLeftClose,
  Sparkles,
  Menu,
  Trash2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/thread`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        setChats(
          data.data.map((thread) => ({
            id: thread.threadId,
            title: thread.title,
            messages: thread.messages || []
          }))
        );
      } catch (error) {
        console.error("Fetch chats error:", error);
      }
    };

    fetchChats();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");

    let chatId = activeChat;

    if (!chatId) {
      chatId = Date.now().toString();
      setActiveChat(chatId);

      setChats((prev) => [
        {
          id: chatId,
          title: userMessage,
          messages: []
        },
        ...prev
      ]);
    }

    // Add user message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  role: "user",
                  content: userMessage
                }
              ]
            }
          : chat
      )
    );

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage,
          threadId: chatId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat request failed");
      }

      // Update chat with backend thread ID
      setActiveChat(data.threadId);

      // Add assistant response
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                id: data.threadId,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    content: data.reply
                  }
                ]
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Chat error:", error);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    content: "Unable to connect to the server. Please try again."
                  }
                ]
              }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (threadId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/thread/${encodeURIComponent(threadId)}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete conversation");
      }

      setChats((prev) =>
        prev.filter((chat) => chat.id !== threadId)
      );

      if (activeChat === threadId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error("Delete chat error:", error);
      alert("Unable to delete conversation. Please try again.");
    }
  };

  // Current selected chat
  const currentChat = chats.find((chat) => chat.id === activeChat);

  // Automatic scrolling
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [currentChat?.messages.length, loading]);

  // Start new chat
  const newChat = () => {
    setActiveChat(null);
    setMessage("");
  };

  return (
    <div className="app-container">

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="sidebar">

          <div className="sidebar-header">
            <div className="brand">
              <Sparkles size={24} />
              <span>Aether GPT</span>
            </div>

            <button
              className="icon-btn"
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          </div>

          <button className="new-chat-btn" onClick={newChat}>
            <Plus size={19} />
            New Chat
          </button>

          <div className="history-heading">
            Your Conversations
          </div>

          <div className="chat-history">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`history-item ${
                  activeChat === chat.id ? "active" : ""
                }`}
              >
                <button
                  className="history-chat-btn"
                  onClick={() => setActiveChat(chat.id)}
                  title={chat.title}
                >
                  <MessageSquare size={17} />
                  <span>{chat.title}</span>
                </button>

                <button
                  className="delete-chat-btn"
                  onClick={() => deleteChat(chat.id)}
                  title="Delete conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-avatar">S</div>

            <div className="user-info">
              <strong>Souvik</strong>
              <small style={{ color: "white", paddingLeft: "30px" }}>Personal Account</small>
            </div>
          </div>

        </aside>
      )}

      <main className="main-content">

        <header className="topbar">

          {!sidebarOpen && (
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              <Menu size={22} />
            </button>
          )}

          <span className="model-name">
            Aether GPT <span>3.6</span>
          </span>

        </header>

        {/* Chat Area */}
        <section className="chat-area">

          {!currentChat ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <Sparkles size={32} />
              </div>

              <h1>What can I help you with?</h1>
              <p>
                Ask anything. Explore ideas. Create something amazing.
              </p>
            </div>
          ) : (
            <div className="messages-container">

              {currentChat.messages.map((msg, index) => (
                <Message
                  key={index}
                  role={msg.role}
                  content={msg.content}
                />
              ))}

              {loading && activeChat === currentChat.id && (
                <div className="message-row assistant">
                  <div className="message-avatar">
                    <Sparkles size={18} />
                  </div>

                  <div className="typing-indicator">
                    <BeatLoader
                      color="#a78bfa"
                      size={8}
                      margin={3}
                    />
                  </div>
                </div>
              )}

              <div ref={bottomRef}></div>

            </div>
          )}

        </section>

        <div className="input-section">

          <div className="input-box">

            <textarea
              placeholder="What's the plan?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
            />

            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!message.trim() || loading}
            >
              <Send size={22} />
            </button>

          </div>

          <p className="disclaimer">
            Aether GPT can make mistakes. Verify important information.
          </p>

        </div>
      </main>
    </div>
  );
}

export default App;