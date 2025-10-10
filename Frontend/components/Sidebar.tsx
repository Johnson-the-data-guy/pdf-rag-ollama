// src/components/Sidebar.tsx
import { Github, Linkedin, X } from "lucide-react";
import FocusLock from "react-focus-lock";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicClick: (topic: string) => void;
}

export const Sidebar = ({ isOpen, onClose, onTopicClick }: SidebarProps) => {
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
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-label="Document overview"
        className={`fixed top-0 left-0 h-full sm:w-72 w-full max-w-xs bg-[#2D2D2D] text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <FocusLock disabled={!isOpen}>
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
                      onClose(); // Close the sidebar on click
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
            <h3 className="text-gray-400 text-sm font-semibold mb-3">
              Connect
            </h3>
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
        </FocusLock>
      </div>
    </>
  );
};
