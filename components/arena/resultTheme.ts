import { Handshake, Skull, Trophy } from 'lucide-react';

export const RESULT_THEME = {
  win: {
    border: 'border-[#e9c400]/40',
    glow: 'bg-[#e9c400]/20',
    iconBg: 'bg-[#e9c400]/20 shadow-[0_0_40px_rgba(255,214,0,0.5)]',
    iconColor: 'text-[#ffe170]',
    badge: 'bg-[#e9c400] text-black',
    Icon: Trophy,
  },
  lose: {
    border: 'border-rose-500/40',
    glow: 'bg-rose-500/20',
    iconBg: 'bg-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.5)]',
    iconColor: 'text-rose-400',
    badge: 'bg-rose-500 text-white',
    Icon: Skull,
  },
  draw: {
    border: 'border-[#00d2ff]/40',
    glow: 'bg-[#00d2ff]/20',
    iconBg: 'bg-[#00d2ff]/20 shadow-[0_0_40px_rgba(0,210,255,0.5)]',
    iconColor: 'text-[#00d2ff]',
    badge: 'bg-[#00d2ff] text-black',
    Icon: Handshake,
  },
} as const;
