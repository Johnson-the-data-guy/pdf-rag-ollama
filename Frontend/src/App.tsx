import { useState, useRef, useEffect } from "react";
import { Send, Menu, Github, Linkedin, X } from "lucide-react";

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
        <p className="whitespace-pre-wrap">{message}</p>
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
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicClick: (topic: string) => void;
}

function Sidebar({ isOpen, onClose, onTopicClick }: SidebarProps) {
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
        <div className="p-5 flex justify-between items-center border-b border-[#3A3A3A]">
          <h2 className="text-lg font-semibold">Document Overview</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#3A3A3A] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto h-[calc(100%-140px)]">
          <h3 className="text-gray-400 text-sm font-semibold mb-3">
            What you can learn:
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
        <div className="absolute bottom-0 w-full p-5 border-t border-[#3A3A3A]">
          <h3 className="text-gray-400 text-sm font-semibold mb-3">Connect</h3>
          <div className="flex space-x-4">
            <a
              href="https://github.com/Johnson-the-data-guy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <Github size={20} />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/johnson-the-data-guy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Main App Component ---

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      const response = await fetch("http://127.0.0.1:5000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: currentQuery }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please make sure the backend server is running and try again.",
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
      />

      <header className="flex-shrink-0 border-b border-[#2D2D2D] py-4 px-6 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-full hover:bg-[#2D2D2D] cursor-pointer"
        >
          <Menu className="text-white" />
        </button>
        <h1 className="text-center text-white text-lg font-semibold">
          Chat with Modern World History
        </h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
              <div className="mb-8">
                <h2 className="text-white mb-3">
                  Chat with Modern World History
                </h2>
                <p className="text-gray-400">
                  Ask me anything about the document. I'll find the answer for
                  you.
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
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-[#2D2D2D] border-[#3A3A3A] text-white placeholder:text-gray-500 rounded-full px-5 py-3 focus-visible:ring-[#007AFF] focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="rounded-full w-12 h-12 p-0 bg-[#007AFF] hover:bg-[#0066DD] disabled:bg-[#2D2D2D] disabled:text-gray-600 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
