'use client';

import React, { useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import type { Actor } from '@/types/game';

export const COIN_FLIP_MS = 2000;
const EDGE_LAYERS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

interface CoinFlipProps {
  /** Who won the toss; the coin lands showing this side. */
  starter: Actor;
  playerLabel: string;
  botLabel: string;
  onLanded: () => void;
}

/** 3D coin (CSS only): spins for ~2 s, then lands on the starter's face and calls `onLanded`. */
export const CoinFlip: React.FC<CoinFlipProps> = ({ starter, playerLabel, botLabel, onLanded }) => {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(onLanded, reduced ? 250 : COIN_FLIP_MS + 150);
    return () => clearTimeout(timer);
  }, [onLanded]);

  return (
    <div className="coin-scene relative mt-10 flex h-36 w-36 items-end justify-center" aria-hidden="true">
      <div className={`coin ${starter === 'PLAYER' ? 'coin--player' : 'coin--bot'}`}>
        {EDGE_LAYERS.map((z) => (
          <span key={z} className="coin-edge" style={{ transform: `translateZ(${z}px)` }} />
        ))}
        <span className="coin-face coin-face--front" style={{ transform: 'translateZ(5px)' }}>
          <User className="h-10 w-10" />
          <span className="text-[10px] font-black uppercase tracking-wider">{playerLabel}</span>
        </span>
        <span className="coin-face coin-face--back" style={{ transform: 'rotateY(180deg) translateZ(5px)' }}>
          <Bot className="h-10 w-10" />
          <span className="text-[10px] font-black uppercase tracking-wider">{botLabel}</span>
        </span>
      </div>
      <span className="coin-shadow" />
    </div>
  );
};
