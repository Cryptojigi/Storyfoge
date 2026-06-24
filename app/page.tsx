"use client";

import { useState, useRef, useEffect } from "react";
import { generateStoryContinuation, type Message } from "@/lib/0g-compute";
import { saveStoryToStorage, loadStoryFromStorage } from "@/lib/0g-storage";
import SaveReceiptModal from "@/components/SaveReceiptModal";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [savedHashData, setSavedHashData] = useState<{hash: string, url: string} | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [loadHash, setLoadHash] = useState("");
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [loadError, setLoadError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const fetchAIResponse = async (chatHistory: Message[]) => {
    setIsGenerating(true);
    try {
      const aiResponseContent = await generateStoryContinuation(chatHistory);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: aiResponseContent },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "ai", 
          content: `[System Error]: ${error.message || "Failed to fetch AI response from 0G Compute."}` 
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartStory = () => {
    if (prompt.trim()) {
      setIsSessionActive(true);
      setCustomTitle(prompt);
      const initialMessage: Message = { role: "user", content: prompt };
      setMessages([initialMessage]);
      fetchAIResponse([initialMessage]);
    }
  };

  const handleBackToHome = () => {
    setIsSessionActive(false);
    setPrompt("");
    setMessages([]);
    setCurrentInput("");
    setIsGenerating(false);
    setIsSaving(false);
    setSaveFeedback("");
    setSavedHashData(null);
    setIsReceiptModalOpen(false);
    setLoadHash("");
    setLoadError("");
    setCustomTitle("");
    setIsEditingTitle(false);
  };

  const handleLoadStory = async () => {
    if (!loadHash.trim()) return;
    setIsLoadingStory(true);
    setLoadError("");

    try {
      const result = await loadStoryFromStorage(loadHash.trim());
      // Populate state with the loaded story
      setPrompt(result.story.title);
      setCustomTitle(result.story.title);
      setMessages(result.story.messages);
      setIsSessionActive(true);
      setLoadHash("");
    } catch (error: any) {
      setLoadError(error.message);
    } finally {
      setIsLoadingStory(false);
    }
  };

  const handleSaveStory = async () => {
    if (messages.length < 2 || isSaving) return;
    
    setIsSaving(true);
    setSaveFeedback("Saving to 0G Storage...");
    setSavedHashData(null);
    
    try {
      const result = await saveStoryToStorage(customTitle || prompt, messages);
      setSavedHashData({ hash: result.rootHash, url: result.txHash });
      setSaveFeedback("");
      setIsReceiptModalOpen(true);
    } catch (error: any) {
      setSaveFeedback(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    if (currentInput.trim() && !isGenerating) {
      const newUserMessage: Message = { role: "user", content: currentInput };
      
      setMessages((prev) => {
        const updatedMessages = [...prev, newUserMessage];
        fetchAIResponse(updatedMessages);
        return updatedMessages;
      });
      
      setCurrentInput("");
    }
  };

  return (
    <div
      className={`relative flex flex-1 flex-col items-center bg-transparent px-4 selection:bg-orange-500/30 transition-all duration-500 w-full ${
        isSessionActive ? "py-8" : "justify-center py-20"
      }`}
    >


      {!isSessionActive ? (
        /* ── LANDING VIEW ── */
        <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 animate-in fade-in zoom-in-95 duration-500">
          {/* Logo / Header */}
          <header className="flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-5">
              {/* 3D-ish cube icon */}
              <div className="amber-glow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5a623] via-[#e8842c] to-[#c86415] shadow-2xl">
                {/* Book / quill icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-white drop-shadow-md"
                >
                  <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                {/* Subtle sparkle accents */}
                <div
                  aria-hidden
                  className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300/80"
                />
                <div
                  aria-hidden
                  className="absolute -top-2 right-1.5 h-1 w-1 rounded-full bg-amber-200/60"
                />
              </div>

              <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl pb-1">
                Storyfoge
              </h1>
            </div>

            <p className="max-w-md text-lg leading-relaxed text-zinc-400">
              Create and continue interactive stories powered by decentralized AI
              on{" "}
              <span className="font-semibold text-[#f5a623]">0G</span>
            </p>
          </header>

          {/* Load Story Section */}
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="Paste 0x... Root Hash to load existing story"
                  value={loadHash}
                  onChange={(e) => setLoadHash(e.target.value)}
                  className="flex-1 rounded-xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#16181d] px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#e8842c]/50 transition-colors shadow-inner"
                />
              <button
                onClick={handleLoadStory}
                disabled={!loadHash.trim() || isLoadingStory}
                className="flex items-center justify-center rounded-xl bg-black/[0.05] dark:bg-white/[0.05] border border-black/10 dark:border-white/[0.08] px-6 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-all hover:bg-black/[0.1] dark:hover:bg-white/[0.1] hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingStory ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  "Load Story"
                )}
              </button>
            </div>
            {loadError && (
              <p className="text-xs text-red-400 text-center w-full px-2">
                {loadError}
              </p>
            )}
          </div>

          <div className="flex w-full items-center gap-4 py-2 opacity-60">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-black/10 dark:to-white/[0.08]"></div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.2em]">OR START NEW</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-black/10 dark:to-white/[0.08]"></div>
          </div>

          {/* Prompt area */}
          <div className="textarea-wrapper w-full rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#16181d] p-1 shadow-2xl shadow-black/10 dark:shadow-black/40 transition-all duration-300">
            <textarea
              id="story-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the story you want to create…&#10;&#10;e.g. A detective mystery set in a cyberpunk city where AI has gone rogue"
              className="w-full resize-none rounded-xl bg-transparent px-5 py-4 text-base leading-relaxed text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-0"
            />
          </div>

          {/* Start button */}
          <button
            id="start-story-btn"
            disabled={prompt.trim().length === 0}
            onClick={handleStartStory}
            className="group relative inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8842c] to-[#f5a623] px-8 text-base font-semibold text-white shadow-lg shadow-orange-600/20 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-lg disabled:hover:brightness-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                fillRule="evenodd"
                d="M2 10a.75.75 0 0 1 .75-.75h12.59l-2.1-1.95a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.1-1.95H2.75A.75.75 0 0 1 2 10Z"
                clipRule="evenodd"
              />
            </svg>
            Start Story
          </button>

          {/* Feature Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
            {/* The Old Way */}
            <div className="flex flex-col gap-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.06] p-6 text-sm">
              <div className="flex items-center gap-3 text-red-500 dark:text-red-400 font-semibold mb-2 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Traditional AI
              </div>
              <p className="text-zinc-600 dark:text-zinc-500 font-medium">Why standard AI storytelling falls short:</p>
              <ul className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-400">
                <li className="flex gap-3"><span className="text-red-500/80 mt-1">■</span> <span><b>Forgets Details:</b> Characters and plotlines get lost after a few prompts.</span></li>
                <li className="flex gap-3"><span className="text-red-500/80 mt-1">■</span> <span><b>Centralized Ownership:</b> The platform owns your story and can delete it anytime.</span></li>
                <li className="flex gap-3"><span className="text-red-500/80 mt-1">■</span> <span><b>Fragmented:</b> Hard to share, branch, or continue stories collaboratively.</span></li>
              </ul>
            </div>

            {/* The Storyfoge Way */}
            <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#e8842c]/10 to-transparent border border-[#e8842c]/20 p-6 text-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8842c]/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 text-[#f5a623] font-semibold mb-2 relative z-10 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                The Storyfoge Way
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium relative z-10">How our platform enhances creativity:</p>
              <ul className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-300 relative z-10">
                <li className="flex gap-3"><span className="text-[#e8842c] mt-1">■</span> <span><b>Persistent Memory:</b> Powered by 0G Storage, your entire world is remembered.</span></li>
                <li className="flex gap-3"><span className="text-[#e8842c] mt-1">■</span> <span><b>True Ownership:</b> Your story is decentralized. Only you control the Root Hash.</span></li>
                <li className="flex gap-3"><span className="text-[#e8842c] mt-1">■</span> <span><b>Fork & Branch:</b> Load any story via hash and explore endless alternative paths.</span></li>
              </ul>
            </div>

            {/* Upcoming Features */}
            <div className="flex flex-col gap-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/[0.06] p-6 text-sm">
              <div className="flex items-center gap-3 text-blue-500 dark:text-blue-400 font-semibold mb-2 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                Upcoming Features
              </div>
              <p className="text-zinc-600 dark:text-zinc-500 font-medium">What's next on our roadmap:</p>
              <ul className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-400">
                <li className="flex gap-3"><span className="text-blue-500/80 mt-1">■</span> <span><b>Story Dashboard:</b> Search and manage all your saved 0G stories in one place.</span></li>
                <li className="flex gap-3"><span className="text-blue-500/80 mt-1">■</span> <span><b>Persistent Characters:</b> Create characters with backstories the AI never forgets.</span></li>
                <li className="flex gap-3"><span className="text-blue-500/80 mt-1">■</span> <span><b>Social Gallery:</b> Publish, rate, and fork public stories with the community.</span></li>
                <li className="flex gap-3"><span className="text-blue-500/80 mt-1">■</span> <span className="italic text-zinc-500">And much more coming soon...</span></li>
              </ul>
            </div>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-600 mt-6">
            Stories are generated and stored on the{" "}
            <span className="text-zinc-600 dark:text-zinc-500 font-medium">0G decentralized network</span>.
            Your data stays yours.
          </p>
        </main>
      ) : (
        /* ── STORY SESSION VIEW ── */
        <main className="relative z-10 flex w-full max-w-6xl flex-col h-[90vh] animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/10 dark:border-white/[0.08] pb-4 mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5a623] to-[#c86415] shadow-lg shadow-orange-600/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className="flex-1 w-full overflow-hidden">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                    autoFocus
                    className="w-full bg-transparent text-lg font-semibold text-zinc-900 dark:text-zinc-100 outline-none border-b border-[#e8842c]/50 px-1 py-0.5"
                  />
                ) : (
                  <h2 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 w-full cursor-text hover:text-zinc-600 dark:hover:text-white transition-colors group flex items-center gap-2"
                    title="Click to edit title"
                  >
                    {customTitle || prompt}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-0 group-hover:opacity-100 text-zinc-400 dark:text-zinc-500 transition-opacity shrink-0">
                      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                    </svg>
                  </h2>
                )}
                <p className="text-xs text-zinc-500 mt-1">
                  Story Session on 0G Network
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
              {saveFeedback && (
                <span className={`text-xs font-medium break-all w-full sm:w-auto text-center sm:text-left ${saveFeedback.includes("failed") ? "text-red-400" : "text-[#e8842c]"}`}>
                  {saveFeedback}
                </span>
              )}
              
              <div className="flex w-full sm:w-auto gap-3">
                {messages.length > 1 && (
                  <button
                    onClick={handleSaveStory}
                    disabled={isSaving}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-[#e8842c]/30 bg-[#e8842c]/10 px-4 py-2 text-sm font-medium text-[#f5a623] transition-colors hover:bg-[#e8842c]/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4Zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37ZM3 13.179V15c0 2.21 3.134 4 7 4s7-1.79 7-4v-1.822c-.396.37-.842.688-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 0 1 3 13.179Z" clipRule="evenodd" />
                      </svg>
                    )}
                    Save Story
                  </button>
                )}

                <button
                  onClick={handleBackToHome}
                  className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-black/10 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  New Story
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Story Area */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#16181d]/60 p-6 shadow-xl backdrop-blur-md mb-6 custom-scrollbar">
            <div className="flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex w-full flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span
                    className={`mb-1 text-xs ${
                      msg.role === "user"
                        ? "mr-2 text-zinc-500"
                        : "ml-2 text-orange-400/70"
                    }`}
                  >
                    {msg.role === "user" ? "You" : "Storyfoge AI"}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-[#e8842c]/20 to-[#f5a623]/10 border border-[#e8842c]/20"
                        : "rounded-tl-sm bg-white/[0.03] border border-white/[0.05]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Placeholder for AI Response */}
              {isGenerating && (
                <div className="flex w-full flex-col items-start animate-pulse">
                  <span className="mb-1 ml-2 text-xs text-orange-400/70">
                    Storyfoge AI
                  </span>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.05] px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-orange-400/50 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-orange-400/50 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-orange-400/50 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="textarea-wrapper flex-1 rounded-2xl border border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#16181d] p-1 shadow-2xl transition-all duration-300">
              <textarea
                rows={2}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleContinue();
                  }
                }}
                placeholder="What happens next? Guide the story..."
                className="w-full resize-none rounded-xl bg-transparent px-5 py-3 text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-0"
              />
            </div>
            <button
              disabled={currentInput.trim().length === 0 || isGenerating}
              onClick={handleContinue}
              className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-black/[0.05] dark:bg-white/[0.05] border border-black/10 dark:border-white/[0.08] px-6 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-all duration-200 hover:bg-[#e8842c] hover:border-transparent hover:text-white hover:shadow-lg hover:shadow-orange-600/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/[0.05] disabled:hover:border-white/[0.08] disabled:hover:text-zinc-200 disabled:hover:shadow-none sm:w-auto min-w-[160px]"
            >
              Continue
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
            </button>
          </div>
        </main>
      )}

      <SaveReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        hashData={savedHashData}
      />
    </div>
  );
}
