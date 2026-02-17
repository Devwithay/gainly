import { createContext, useState, useEffect } from "react";

export const AiContext = createContext();

export const AiProvider = ({ children }) => {
  const [memory, setMemory] = useState(() => {
    const saved = localStorage.getItem("aiMemory");
    return saved ? JSON.parse(saved) : { businessType: null, snippets: [] };
  });

  const [tone, setTone] = useState(
    localStorage.getItem("aiTone") || "friendly",
  );
  const [length, setLength] = useState(
    localStorage.getItem("aiLength") || "medium",
  );

  useEffect(() => {
    localStorage.setItem("aiMemory", JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem("aiTone", tone);
  }, [tone]);

  useEffect(() => {
    localStorage.setItem("aiLength", length);
  }, [length]);

  const saveSnippet = (text) => {
    setMemory((prev) => ({
      ...prev,
      snippets: [...prev.snippets, text].slice(-10),
    }));
  };

  return (
    <AiContext.Provider
      value={{
        memory,
        setMemory,
        tone,
        setTone,
        length,
        setLength,
        saveSnippet,
      }}>
      {children}
    </AiContext.Provider>
  );
};
