import { useState, useRef, useEffect } from "react";
import { MessageIcon, BotIcon, UserIcon, SendIcon } from "../../components/Icons";
import MarkdownRenderer from "../../components/MarkdownRenderer";

export default function ChatView({
  messages,
  setMessages,
  currentCode,
  problemTitle,
  problemContext
}) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { 
      id: Date.now(),
      role: "user", 
      content: input.trim() 
    };
    const newHistory = [...messages, userMsg];

    setMessages(newHistory);
    setInput("");
    setIsTyping(true);

    chrome.runtime.sendMessage(
      {
        type: "SEND_CHAT_MESSAGE",
        payload: {
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content
          })),
          code: currentCode,
          title: problemTitle,
          description: problemContext.description,
          lastError: problemContext.lastError
        }
      },
      (response) => {
        if (response && response.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: "assistant",
              content: response.reply
            }
          ]);
        }
        setIsTyping(false);
      }
    );
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mm-chat">
      <div className="mm-chat__header">
        <MessageIcon />
        <span className="mm-chat__title">Chat</span>
      </div>

      <div className="mm-chat__messages">
        {messages.map((m, index) => (
          <div
            key={m.id || index} 
            className={`mm-message ${m.role === "user" ? "mm-message--user" : ""}`}
          >
            <div className={`mm-message__avatar mm-message__avatar--${m.role === "assistant" ? "bot" : "user"}`}>
              {m.role === "assistant" ? <BotIcon /> : <UserIcon />}
            </div>

            <div className={`mm-message__bubble mm-message__bubble--${m.role === "assistant" ? "bot" : "user"}`}>
              <MarkdownRenderer content={m.content} />
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mm-message">
            <div className="mm-message__avatar mm-message__avatar--bot">
              <BotIcon />
            </div>
            <div className="mm-typing">
              <span className="mm-typing__dot" />
              <span className="mm-typing__dot" />
              <span className="mm-typing__dot" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="mm-chat__input-area">
        <div className="mm-chat__input-wrap">
          <input
            className="mm-chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask your mentor..."
          />
          <button
            className="mm-chat__send"
            onClick={send}
            disabled={!input.trim() || isTyping}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}