import React, { useState } from "react";
import axios from "axios";

const AIChat = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi 👋 I'm your AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/chat", {
        message: input,
      });
      const aiReply = { sender: "ai", text: res.data.reply };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Sorry, something went wrong." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container" style={styles.container}>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#0078ff" : "#e0e0e0",
              color: msg.sender === "user" ? "white" : "black",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.message, backgroundColor: "#e0e0e0" }}>
            Thinking...
          </div>
        )}
      </div>

      <div style={styles.inputBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="Ask something like 'Show my last 5 transactions'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: 600,
    margin: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    height: "80vh",
    justifyContent: "space-between",
    borderRadius: 10,
    boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
    backgroundColor: "#f8f9fa",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
  },
  message: {
    maxWidth: "75%",
    padding: "10px 15px",
    borderRadius: "12px",
    fontSize: "15px",
    lineHeight: "1.4",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default AIChat;
