"use client";

import { useEffect, useState } from "react";

interface SaveReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  hashData: { hash: string; url: string } | null;
}

export default function SaveReceiptModal({ isOpen, onClose, hashData }: SaveReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  // Auto-close after 15 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Handle copy
  const handleCopy = () => {
    if (hashData?.hash) {
      navigator.clipboard.writeText(hashData.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !hashData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#16181d] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Glow accent */}
        <div 
          className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[#e8842c] opacity-20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f5a623]/20 to-[#c86415]/10 border border-[#e8842c]/30 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#f5a623]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-zinc-100">Receipt</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Your story has been permanently saved to <span className="font-semibold text-zinc-300">0G Storage</span>.
          </p>

          {/* Hash Box */}
          <div className="mb-6 w-full rounded-xl bg-black/40 border border-white/[0.05] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span>Root Hash</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 overflow-hidden">
                <a 
                  href={`https://scan-testnet.0g.ai/tx/${hashData.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full truncate text-sm font-medium text-orange-400 hover:text-orange-300 hover:underline underline-offset-2 transition-colors text-left"
                  title="View on 0G Explorer"
                >
                  {hashData.hash}
                </a>
              </div>
              
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] py-3 text-sm font-semibold text-zinc-200 transition-all hover:bg-white/[0.08] hover:text-white"
          >
            Close
          </button>
        </div>

        {/* Top-right X button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
