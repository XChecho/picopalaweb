'use client';

import React from 'react';
import { AppView } from '@/types/game';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  lang: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang }) => {
  return (
    <footer className="w-full bg-[#0c0e14] border-t border-[#1d1f26] py-10 mt-16 shadow-[0_-1px_12px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand info */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff5959] to-[#ff2e95] p-[1px] shadow-[0_0_10px_rgba(255,46,149,0.4)]">
              <div className="w-full h-full bg-[#111319] rounded-[5px] flex items-center justify-center">
                <span className="font-['Cairo'] font-black text-[9px] text-white">P&P</span>
              </div>
            </div>
            <span className="font-['Cairo'] font-bold text-base text-[#e2e2ea] tracking-tight uppercase">
              Pico & Pala
            </span>
            <span className="text-xs text-[#a98891]">· Tactical 1v1 Deduction</span>
          </div>
          <span className="text-xs text-[#a98891] tracking-wide">
            © 2024–2026 Pico & Pala. Crafted for mind-sport by Auron Tale Games.
          </span>
        </div>

        {/* Center: Navigation quick links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#e2bdc7]">
          <button
            onClick={() => onNavigate('how-to-play')}
            className="hover:text-white transition-colors"
          >
            How to Play
          </button>
          <button
            onClick={() => onNavigate('play-hub')}
            className="hover:text-white transition-colors"
          >
            Game Modes
          </button>
          <button
            onClick={() => onNavigate('records')}
            className="hover:text-white transition-colors"
          >
            Records Ledger
          </button>
          <button
            onClick={() => onNavigate('auth')}
            className="hover:text-white transition-colors"
          >
            Duelist Profile
          </button>
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              alert('Terms of Service: Fair play deduction protocols. Algorithmic anti-cheat active.');
            }}
            className="hover:text-white transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              alert('Privacy Policy: All game states and records stored encrypted in local browser cache.');
            }}
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </div>

        {/* Right: Language indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30] text-xs font-bold text-[#a5e7ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
            <span>{lang.toUpperCase()} · v2.4 Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
