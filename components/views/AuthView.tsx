'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  RotateCcw,
  Trophy,
  ArrowRight,
  AlertCircle,
  Check,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppView } from '@/types/game';

interface AuthViewProps {
  onNavigate: (view: AppView) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation('auth');
  const [authTab, setAuthTab] = useState<'register' | 'login' | 'preview'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('short');
  const [password, setPassword] = useState('SecretAlpha99#');
  const [handle, setHandle] = useState('cipher_duelist');
  const [email, setEmail] = useState('duelist@auron.gg');
  const [tosAgreed, setTosAgreed] = useState(true);

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Mobile brand header (shown on small screens) */}
      <div className="lg:hidden flex flex-col items-center mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191b21] border border-[#282a30] mb-3">
          <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
          <span className="text-xs font-bold text-[#00d2ff] uppercase tracking-widest">
            {t('mobile.badge')}
          </span>
        </div>
        <h1 className="font-['Cairo'] text-3xl sm:text-4xl font-black text-white uppercase">
          {t('mobile.titlePrefix')} <span className="text-[#ff479b]">{t('mobile.titleHighlight')}</span>
        </h1>
      </div>

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT PANEL: Lore & Live Board Mockup */}
        <section className="hidden lg:flex lg:col-span-6 bg-[#191b21] border border-[#282a30] rounded-3xl p-8 relative overflow-hidden flex-col justify-between shadow-2xl">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff479b]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00d2ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-8 font-['Cairo'] text-[170px] leading-none font-black text-white/[0.03] select-none pointer-events-none">
            7
          </div>
          <div className="absolute bottom-16 left-6 font-['Cairo'] text-[190px] leading-none font-black text-white/[0.03] select-none pointer-events-none">
            1
          </div>

          {/* Top Status & Lore */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111319] border border-[#282a30] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping" />
              <span className="text-xs font-bold text-[#a5e7ff] uppercase tracking-wider">
                {t('left.season')}
              </span>
            </div>

            <h2 className="font-['Cairo'] text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
              {t('left.titleLine1')} <br />
              <span className="bg-gradient-to-r from-[#ff5959] via-[#ff2e95] to-[#00d2ff] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,46,149,0.4)]">
                {t('left.titleLine2')}
              </span>
            </h2>

            <p className="text-sm text-[#e2bdc7] max-w-md leading-relaxed">
              {t('left.description')}
            </p>
          </div>

          {/* Live Game Board Mockup Card */}
          <div className="relative z-10 my-6 bg-[#111319] border border-[#282a30] rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#282a30]">
              <div className="flex items-center gap-2">
                <span className="font-['Cairo'] text-xs font-bold text-white uppercase tracking-wider">
                  {t('left.liveDuel', { turn: '04', max: '08' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#191b21] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono text-[#a98891]">00:14</span>
              </div>
            </div>

            <div className="space-y-2">
              {/* Row 1 */}
              <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#a98891] w-5">01</span>
                  <div className="flex gap-1">
                    {[5, 2, 8, 3].map((d, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded bg-[#0c0e14] flex items-center justify-center font-['Cairo'] text-sm font-black text-white"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#0c0e14] px-2 py-0.5 rounded">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e9c400]" />
                    <span className="text-xs text-[#ffe170] font-bold">{t('left.picoCount', { n: 1 })}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0c0e14] px-2 py-0.5 rounded">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-[#ff479b]" />
                    <span className="text-xs text-[#ffb0ca] font-bold">{t('left.palaCount', { n: 1 })}</span>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="bg-[#191b21] border border-[#282a30] rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#a98891] w-5">02</span>
                  <div className="flex gap-1">
                    {[7, 2, 1, 9].map((d, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded bg-[#0c0e14] flex items-center justify-center font-['Cairo'] text-sm font-black text-white"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#0c0e14] px-2 py-0.5 rounded">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e9c400]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e9c400]" />
                    <span className="text-xs text-[#ffe170] font-bold ml-1">{t('left.picoCount', { n: 2 })}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0c0e14] px-2 py-0.5 rounded">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-[#ff479b]" />
                    <span className="text-xs text-[#ffb0ca] font-bold">{t('left.palaCount', { n: 1 })}</span>
                  </div>
                </div>
              </div>

              {/* Row 3 Winning */}
              <div className="bg-[#e9c400]/15 border border-[#e9c400] rounded-xl p-2.5 flex items-center justify-between shadow-[0_0_15px_rgba(233,196,0,0.25)]">
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-[#ffe170]" />
                  <div className="flex gap-1 font-['Cairo'] text-sm font-black text-[#ffe170]">
                    {[7, 1, 8, 4].map((d, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded bg-[#0c0e14] flex items-center justify-center shadow-sm"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#e9c400]/30 px-2.5 py-0.5 rounded text-xs font-black text-[#ffe170] uppercase">
                  <span>●●●● {t('left.decrypted')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-3 bg-[#111319] border border-[#282a30] px-4 py-2 rounded-2xl">
              <div className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#ff479b] text-[10px] font-black text-white flex items-center justify-center ring-2 ring-[#191b21]">
                  K
                </span>
                <span className="w-6 h-6 rounded-full bg-[#00d2ff] text-[10px] font-black text-black flex items-center justify-center ring-2 ring-[#191b21]">
                  R
                </span>
                <span className="w-6 h-6 rounded-full bg-[#ffe170] text-[10px] font-black text-black flex items-center justify-center ring-2 ring-[#191b21]">
                  Z
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#e2e2ea]">
                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
                <span>
                  {t('left.joinPrefix')} <strong className="text-[#ff479b]">{t('left.joinHighlight')}</strong> {t('left.joinSuffix')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#a98891]">
              <span>{t('left.freeToPlay')}</span>
              <span>•</span>
              <span>{t('left.zeroAds')}</span>
              <span>•</span>
              <span>{t('left.matchmaking')}</span>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Auth Suite */}
        <section className="lg:col-span-6 bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 relative shadow-2xl flex flex-col justify-between overflow-hidden">
          <div>
            {/* Tab switcher */}
            <div className="flex p-1 bg-[#0c0e14] border border-[#282a30] rounded-full max-w-md mx-auto mb-8 shadow-inner">
              <button
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2 text-center rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  authTab === 'register'
                    ? 'bg-[#ff479b] text-white shadow-[0_0_15px_rgba(255,46,149,0.4)]'
                    : 'text-[#a98891] hover:text-white'
                }`}
              >
                {t('tabs.register')}
              </button>
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2 text-center rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  authTab === 'login'
                    ? 'bg-[#00d2ff] text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                    : 'text-[#a98891] hover:text-white'
                }`}
              >
                {t('tabs.login')}
              </button>
              <button
                onClick={() => setAuthTab('preview')}
                className={`flex-1 py-2 text-center rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  authTab === 'preview'
                    ? 'bg-[#e9c400] text-black shadow-[0_0_15px_rgba(255,214,0,0.4)]'
                    : 'text-[#a98891] hover:text-white'
                }`}
              >
                <span>{t('tabs.preview')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]" />
              </button>
            </div>

            {/* REGISTER PANE */}
            {authTab === 'register' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
                    {t('register.titlePrefix')} <span className="text-[#ff479b]">{t('register.titleHighlight')}</span>
                  </h2>
                  <p className="text-xs text-[#a98891] mt-1">
                    {t('register.subtitle')}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAuthTab('preview');
                  }}
                  className="space-y-4"
                >
                  {/* Duelist Handle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        {t('register.handleLabel')}
                      </label>
                      <span className="text-[11px] text-[#a98891]">{t('register.handleHint')}</span>
                    </div>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#ff479b] transition-all"
                        placeholder={t('register.handlePlaceholder')}
                        required
                      />
                      <CheckCircle2 className="w-4 h-4 absolute right-3.5 text-[#00d2ff]" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                      {t('register.emailLabel')}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#ff479b] transition-all"
                        placeholder="you@domain.gg"
                        required
                      />
                      <Check className="w-4 h-4 absolute right-3.5 text-[#00d2ff]" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        {t('register.passwordLabel')}
                      </label>
                      <span className="text-[11px] text-[#a98891]">{t('register.passwordHint')}</span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#ff479b] transition-all"
                        placeholder="••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#a98891] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Error state demo) */}
                  <div>
                    <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                      {t('register.confirmLabel')}
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 absolute left-3.5 text-rose-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-rose-950/20 text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] focus:outline-none transition-all"
                      />
                      <AlertCircle className="w-4 h-4 absolute right-3.5 text-rose-400" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-rose-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{t('register.passwordError')}</span>
                    </div>
                  </div>

                  {/* TOS Agreement */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="tos-check"
                      checked={tosAgreed}
                      onChange={(e) => setTosAgreed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded accent-[#ff479b] cursor-pointer"
                    />
                    <label htmlFor="tos-check" className="text-xs text-[#a98891] cursor-pointer">
                      {t('register.tosPrefix')} <span className="text-[#00d2ff] underline">{t('register.tosTerms')}</span> {t('register.tosAnd')}{' '}
                      <span className="text-[#00d2ff] underline">{t('register.tosPrivacy')}</span>{t('register.tosSuffix')}
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:shadow-[0_0_30px_rgba(255,46,149,0.7)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t('register.submit')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Social Login */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="w-full h-px bg-[#282a30]" />
                  <span className="absolute bg-[#191b21] px-3 text-[10px] uppercase font-bold text-[#a98891] tracking-widest">
                    {t('register.orContinue')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthTab('preview')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#111319] hover:bg-[#282a30] border border-[#282a30] rounded-xl text-white text-xs font-bold transition-all"
                  >
                    <span className="font-bold">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('preview')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#111319] hover:bg-[#282a30] border border-[#282a30] rounded-xl text-white text-xs font-bold transition-all"
                  >
                    <span className="font-bold">Apple</span>
                  </button>
                </div>

                <p className="text-center text-xs text-[#a98891] pt-2">
                  {t('register.haveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className="text-[#00d2ff] font-bold hover:underline ml-1"
                  >
                    {t('register.loginLink')}
                  </button>
                </p>
              </div>
            )}

            {/* LOGIN PANE */}
            {authTab === 'login' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
                    {t('login.titlePrefix')} <span className="text-[#00d2ff]">{t('login.titleHighlight')}</span>
                  </h2>
                  <p className="text-xs text-[#a98891] mt-1">
                    {t('login.subtitle')}
                  </p>
                </div>

                {/* Auth Error Banner */}
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-rose-400 block">{t('login.errorTitle')}</span>
                    <span className="text-xs text-rose-300">
                      {t('login.errorMessage')}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAuthTab('preview');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                      {t('login.identifierLabel')}
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                      <input
                        type="text"
                        defaultValue="cipher_duelist@auron.gg"
                        className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-4 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#00d2ff] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-white uppercase tracking-wider">
                        {t('login.passwordLabel')}
                      </label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert(t('login.forgotAlert')); }} className="text-xs text-[#00d2ff] hover:underline">
                        {t('login.forgot')}
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <Key className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                      <input
                        type="password"
                        defaultValue="password123"
                        className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#00d2ff] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" defaultChecked className="h-4 w-4 rounded accent-[#00d2ff]" />
                      <label htmlFor="remember" className="text-[#a98891]">{t('login.remember')}</label>
                    </div>
                    <span className="text-[#ffe170] flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e9c400]" /> {t('login.safeNode')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00d2ff] to-emerald-400 text-black font-['Cairo'] font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    {t('login.submit')}
                  </button>
                </form>

                <p className="text-center text-xs text-[#a98891] pt-2">
                  {t('login.newHere')}{' '}
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className="text-[#ff479b] font-bold hover:underline ml-1"
                  >
                    {t('login.registerLink')}
                  </button>
                </p>
              </div>
            )}

            {/* PREVIEW / ONBOARDING VIEW */}
            {authTab === 'preview' && (
              <div className="text-center py-4 space-y-6 animate-in fade-in">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full bg-[#e9c400]/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-[#282a30] border border-[#e9c400]/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.4)]">
                    <Trophy className="w-10 h-10 text-[#ffe170]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111319] border border-[#282a30]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00d2ff]">
                      {t('preview.badge')}
                    </span>
                  </div>
                  <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
                    {t('preview.welcome')} <span className="text-[#ffe170]">{handle}!</span>
                  </h2>
                  <p className="text-xs text-[#a98891] max-w-sm mx-auto">
                    {t('preview.description')}
                  </p>
                </div>

                <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-4 max-w-md mx-auto grid grid-cols-3 gap-2 text-left">
                  <div className="bg-[#191b21] p-3 rounded-xl">
                    <span className="text-[10px] text-[#a98891] block uppercase">{t('preview.tierRank')}</span>
                    <span className="font-['Cairo'] text-lg text-[#ffe170] font-black">{t('preview.tierValue')}</span>
                  </div>
                  <div className="bg-[#191b21] p-3 rounded-xl">
                    <span className="text-[10px] text-[#a98891] block uppercase">{t('preview.startingXp')}</span>
                    <span className="font-['Cairo'] text-lg text-[#00d2ff] font-black">+500</span>
                  </div>
                  <div className="bg-[#191b21] p-3 rounded-xl">
                    <span className="text-[10px] text-[#a98891] block uppercase">{t('preview.eloBaseline')}</span>
                    <span className="font-['Cairo'] text-lg text-[#ffb0ca] font-black">1000</span>
                  </div>
                </div>

                <div className="pt-2 max-w-md mx-auto space-y-2">
                  <button
                    onClick={() => onNavigate('arena')}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,46,149,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t('preview.playFirst')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('records')}
                    className="w-full py-2 text-center text-xs font-bold text-[#a98891] hover:text-white transition-colors"
                  >
                    {t('preview.viewRecords')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[#282a30] flex items-center justify-between text-[#a98891] text-xs">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>{t('footer.protocol')}</span>
            </div>
            <span>v4.1.8-pro</span>
          </div>
        </section>
      </div>
    </div>
  );
};
