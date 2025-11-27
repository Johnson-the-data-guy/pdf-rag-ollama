import { useState, useRef, useEffect } from "react";
import { Send, Menu, Github, Linkedin, X, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";

// --- Types ---
interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

type BackendType = "flask_manual" | "fastapi_chain";

// --- Sub-Components ---

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } gap-2 mb-4 items-end`}
    >
      {!isUser && <span className="text-2xl mb-1">🤖</span>}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-[#2D2D2D] text-white" : "bg-[#3A3A3A] text-gray-100"
        }`}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              // Custom styling for specific elements
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <span className="font-bold text-blue-300">{children}</span>
              ),
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-md font-bold mb-1 mt-2">{children}</h3>
              ),
              code: ({ children }) => (
                <code className="bg-black/30 rounded px-1 py-0.5 font-mono text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && <span className="text-2xl mb-1">👤</span>}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2 mb-4 items-end">
      <span className="text-2xl mb-1">🤖</span>
      <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-[#3A3A3A]">
        <div className="flex gap-1.5 items-center">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicClick: (topic: string) => void;
  currentBackend: BackendType;
  onBackendChange: (backend: BackendType) => void;
}

function Sidebar({
  isOpen,
  onClose,
  onTopicClick,
  currentBackend,
  onBackendChange,
}: SidebarProps) {
  const topics = [
    "The Start of the Modern World in Asia",
    "Europe, Africa, and the Americas",
    "Early Globalization and Revolutions",
    "The Troubled Nineteenth Century",
    "Imperialism and The Great War (WWI)",
    "The Modern Crisis and World War II",
    "Decolonization and the Cold War",
    "Neoliberal Globalization",
    "Limits to Growth and the Future",
  ];

  return (
    <>
      <div
        className={`fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#2D2D2D] text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-[#3A3A3A]">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#3A3A3A] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Backend Switcher (The Radio Buttons) */}
        <div className="p-5 border-b border-[#3A3A3A]">
          <h3 className="text-gray-400 text-sm font-semibold mb-3 flex items-center gap-2">
            <Settings size={16} /> AI Model Backend
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-[#3A3A3A] p-2 rounded transition-colors">
              <input
                type="radio"
                name="backend"
                checked={currentBackend === "flask_manual"}
                onChange={() => onBackendChange("flask_manual")}
                className="accent-[#007AFF]"
              />
              <span className="text-sm">Manual RAG (Flask :5000)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-[#3A3A3A] p-2 rounded transition-colors">
              <input
                type="radio"
                name="backend"
                checked={currentBackend === "fastapi_chain"}
                onChange={() => onBackendChange("fastapi_chain")}
                className="accent-[#007AFF]"
              />
              <span className="text-sm">Chain Memory (FastAPI :8000)</span>
            </label>
          </div>
        </div>

        {/* Topics */}
        <div className="p-5 overflow-y-auto h-[calc(100%-280px)]">
          <h3 className="text-gray-400 text-sm font-semibold mb-3">
            Example Topics:
          </h3>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li key={topic}>
                <button
                  onClick={() => {
                    onTopicClick(`Summarize the chapter on: ${topic}`);
                    onClose();
                  }}
                  className="text-left w-full text-gray-300 hover:text-blue-400 hover:underline p-2 rounded-md transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-5 border-t border-[#3A3A3A]">
          <h3 className="text-gray-400 text-sm font-semibold mb-3">Connect</h3>
          <div className="flex space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <Github size={20} /> GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <Linkedin size={20} /> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Main App Component ---

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for the Backend Toggle
  const [backendType, setBackendType] = useState<BackendType>("fastapi_chain");

  // Session ID for Stateful Backend
  const [sessionId] = useState(
    () => "session_" + Math.random().toString(36).substr(2, 9)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTopicClick = (topic: string) => {
    setInputValue(topic);
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // 1. Add User Message locally
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentQuery = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      let url = "";
      let body = {};

      // 2. Logic Switch based on Radio Button
      if (backendType === "flask_manual") {
        // --- Option A: Manual (Flask) ---
        url = "http://127.0.0.1:5000/query";
        body = { query_text: currentQuery }; // Manual only needs text
      } else {
        // --- Option B: Chain (FastAPI) ---
        url = "http://127.0.0.1:8000/chat";
        body = {
          query_text: currentQuery,
          session_id: sessionId, // Chain needs ID for memory
        };
      }

      // 3. Send Request
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // 4. Handle Response (Normalize different key names)
      const aiText =
        data.response || data.answer || "No response content found.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);

      const targetServer =
        backendType === "flask_manual"
          ? "Flask (Port 5000)"
          : "FastAPI (Port 8000)";

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error connecting to ${targetServer}. Please ensure the correct python script is running!`,
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="size-full flex flex-col bg-[#1E1E1E]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTopicClick={handleTopicClick}
        currentBackend={backendType}
        onBackendChange={setBackendType}
      />

      <header className="sticky top-0 z-10 bg-[#1E1E1E]/80 backdrop-blur-md flex-shrink-0 border-b border-[#2D2D2D] py-4 px-6 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-full hover:bg-[#2D2D2D] cursor-pointer"
        >
          <Menu className="text-white" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-white text-lg font-semibold">
            Chat with History
          </h1>
          <span className="text-xs text-gray-400">
            {backendType === "flask_manual"
              ? "Mode: Manual (Stateless)"
              : "Mode: Chain (Memory)"}
          </span>
        </div>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
              <div className="mb-8">
                <h2 className="text-white mb-3 text-2xl font-bold">
                  AI History Assistant
                </h2>
                <p className="text-gray-400 max-w-md">
                  I can answer questions about your PDF.
                  <br />
                  Open the sidebar (☰) to switch between Flask and FastAPI.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[#2D2D2D] p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                backendType === "fastapi_chain"
                  ? "Ask follow-up questions..."
                  : "Ask a single question..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-[#2D2D2D] border-[#3A3A3A] text-white placeholder:text-gray-500 rounded-full px-5 py-3 focus-visible:ring-[#007AFF] focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="rounded-full w-12 h-12 p-0 bg-[#007AFF] hover:bg-[#0066DD] disabled:bg-[#2D2D2D] disabled:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
