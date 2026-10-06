'use client';

import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Trophy,
  ArrowRight,
  AlertCircle,
  Check,
  CheckCircle2,
  Key,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TurnstileWidget, type ITurnstileHandle } from '@/components/TurnstileWidget';
import { VIEW_ROUTES } from '@/hooks/useAppNavigation';
import { useLogin } from '@/hooks/useLogin';
import { useRegister } from '@/hooks/useRegister';
import { ApiError } from '@/lib/api';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AppView } from '@/types/game';

interface AuthViewProps {
  onNavigate: (view: AppView) => void;
}

const USERNAME_PATTERN = /^[A-Za-z0-9]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorMessageKey(error: unknown, captcha = false): string {
  if (error instanceof ApiError) {
    if (error.status === 403 && captcha) return 'errors.captchaRejected';
    if (error.status === 401) return 'errors.invalidCredentials';
    if (error.status === 409) return 'errors.conflict';
    if (error.status === 429) return 'errors.rateLimited';
    if (error.status === 400) return 'errors.validation';
    if (error.status === 0) return 'errors.network';
  }
  return 'errors.generic';
}

interface IErrorBannerProps {
  title: string;
  message: string;
}

const ErrorBanner: React.FC<IErrorBannerProps> = ({ title, message }) => (
  <div
    role="alert"
    className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
  >
    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
    <div>
      <span className="text-xs font-bold text-rose-400 block">{title}</span>
      <span className="text-xs text-rose-300">{message}</span>
    </div>
  </div>
);

interface IFieldErrorProps {
  message?: string;
}

const FieldError: React.FC<IFieldErrorProps> = ({ message }) =>
  message ? (
    <div className="flex items-center gap-1.5 mt-1.5 text-rose-400 text-xs">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{message}</span>
    </div>
  ) : null;

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation('auth');
  const lang = useAppStore((state) => state.lang);
  const player = useAuthStore((state) => state.player);
  const authStatus = useAuthStore((state) => state.status);
  const login = useLogin();
  const register = useRegister();

  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Turnstile tokens are single use: held only in memory, cleared on every attempt.
  const captchaRef = useRef<ITurnstileHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaIssue, setCaptchaIssue] = useState<'expired' | 'failed' | null>(null);
  const captchaEnabled = TURNSTILE_SITE_KEY.length > 0;
  const captchaMissing = captchaEnabled && !captchaToken;
  const captchaHintKey = captchaIssue ? `captcha.${captchaIssue}` : 'captcha.pending';

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaIssue(null);
    captchaRef.current?.reset();
  };

  const handleValid = USERNAME_PATTERN.test(handle);
  const emailValid = EMAIL_PATTERN.test(email);
  const passwordValid = password.length >= 8 && password.length <= 72;
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const registerErrors = {
    handle: !handleValid ? t('validation.username') : undefined,
    email: !emailValid ? t('validation.email') : undefined,
    password: !passwordValid ? t('validation.password') : undefined,
    confirm: confirmPassword !== password ? t('validation.mismatch') : undefined,
    tos: !tosAgreed ? t('validation.tos') : undefined,
  };
  const registerFormValid = !Object.values(registerErrors).some(Boolean);

  const switchTab = (tab: 'register' | 'login') => {
    login.reset();
    register.reset();
    setAuthTab(tab);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterSubmitted(true);
    if (!registerFormValid || register.isPending || captchaMissing) return;
    const token = captchaToken;
    // The token is consumed by this attempt whatever the outcome.
    setCaptchaToken(null);
    try {
      await register.mutateAsync({
        username: handle,
        email,
        password,
        language: lang,
        captchaToken: captchaEnabled && token ? token : undefined,
      });
      onNavigate('play-hub');
    } catch {
      // The error is rendered from `register.error`; a new token is needed to retry.
      resetCaptcha();
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (login.isPending) return;
    try {
      await login.mutateAsync({ username: loginUsername.trim(), password: loginPassword });
      onNavigate('play-hub');
    } catch {
      // The error is rendered from `login.error`.
    }
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-xl mx-auto">
        {/* RIGHT PANEL: Auth Suite */}
        <section className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 relative shadow-2xl flex flex-col justify-between overflow-hidden">
          <div>
            {authStatus === 'authenticated' && player ? (
              /* SIGNED-IN VIEW */
              <div className="text-center py-4 space-y-6 animate-in fade-in">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full bg-[#e9c400]/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-[#282a30] border border-[#e9c400]/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,214,0,0.25)]">
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
                    {t('preview.welcome')} <span className="text-[#ffe170]">{player.username}!</span>
                  </h2>
                  <p className="text-xs text-[#a98891] max-w-sm mx-auto">
                    {t('preview.description')}
                  </p>
                </div>

                <div className="bg-[#111319] border border-[#282a30] rounded-2xl p-4 max-w-md mx-auto grid grid-cols-2 gap-2 text-left">
                  <div className="bg-[#191b21] p-3 rounded-xl">
                    <span className="text-[10px] text-[#a98891] block uppercase">{t('preview.rank')}</span>
                    <span className="font-['Cairo'] text-lg text-[#ffe170] font-black">
                      {t(`ranks.${player.rank}`, { ns: 'common' })}
                    </span>
                  </div>
                  <div className="bg-[#191b21] p-3 rounded-xl">
                    <span className="text-[10px] text-[#a98891] block uppercase">{t('preview.elo')}</span>
                    <span className="font-['Cairo'] text-lg text-[#ffb0ca] font-black">{player.elo}</span>
                  </div>
                </div>

                <div className="pt-2 max-w-md mx-auto space-y-2">
                  <button
                    onClick={() => onNavigate('play-hub')}
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
            ) : (
              <>
                {/* Tab switcher */}
                <div className="flex p-1 bg-[#0c0e14] border border-[#282a30] rounded-full max-w-md mx-auto mb-8 shadow-inner">
                  <button
                    type="button"
                    onClick={() => switchTab('register')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      authTab === 'register'
                        ? 'bg-[#ff479b] text-white shadow-[0_0_15px_rgba(255,46,149,0.4)]'
                        : 'text-[#a98891] hover:text-white'
                    }`}
                  >
                    {t('tabs.register')}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className={`flex-1 py-2 text-center rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      authTab === 'login'
                        ? 'bg-[#00d2ff] text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                        : 'text-[#a98891] hover:text-white'
                    }`}
                  >
                    {t('tabs.login')}
                  </button>
                </div>

                {/* REGISTER PANE */}
                {authTab === 'register' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h2 className="font-['Cairo'] text-2xl sm:text-3xl font-black text-white uppercase">
                        {t('register.titlePrefix')} <span className="text-[#ff479b]">{t('register.titleHighlight')}</span>
                      </h2>
                      <p className="text-xs text-[#a98891] mt-1">{t('register.subtitle')}</p>
                    </div>

                    {register.isError && (
                      <ErrorBanner title={t('errors.title')} message={t(errorMessageKey(register.error, true))} />
                    )}

                    <form onSubmit={handleRegister} noValidate className="space-y-4">
                      {/* Duelist Handle */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="register-handle" className="text-xs font-bold text-white uppercase tracking-wider">
                            {t('register.handleLabel')}
                          </label>
                          <span className="text-[11px] text-[#a98891]">{t('register.handleHint')}</span>
                        </div>
                        <div className="relative flex items-center">
                          <User className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                          <input
                            id="register-handle"
                            type="text"
                            autoComplete="username"
                            maxLength={20}
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#ff479b] transition-all"
                            placeholder={t('register.handlePlaceholder')}
                            required
                          />
                          {handleValid && <CheckCircle2 className="w-4 h-4 absolute right-3.5 text-[#00d2ff]" />}
                        </div>
                        {registerSubmitted && <FieldError message={registerErrors.handle} />}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="register-email" className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                          {t('register.emailLabel')}
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                          <input
                            id="register-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#ff479b] transition-all"
                            placeholder={t('register.emailPlaceholder')}
                            required
                          />
                          {emailValid && <Check className="w-4 h-4 absolute right-3.5 text-[#00d2ff]" />}
                        </div>
                        {registerSubmitted && <FieldError message={registerErrors.email} />}
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="register-password" className="text-xs font-bold text-white uppercase tracking-wider">
                            {t('register.passwordLabel')}
                          </label>
                          <span className="text-[11px] text-[#a98891]">{t('register.passwordHint')}</span>
                        </div>
                        <div className="relative flex items-center">
                          <Lock className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                          <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            maxLength={72}
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
                        {registerSubmitted && <FieldError message={registerErrors.password} />}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="register-confirm"
                          className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                            confirmMismatch ? 'text-rose-400' : 'text-white'
                          }`}
                        >
                          {t('register.confirmLabel')}
                        </label>
                        <div className="relative flex items-center">
                          <Lock className={`w-4 h-4 absolute left-3.5 ${confirmMismatch ? 'text-rose-400' : 'text-[#a98891]'}`} />
                          <input
                            id="register-confirm"
                            type="password"
                            autoComplete="new-password"
                            maxLength={72}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={
                              confirmMismatch
                                ? 'w-full bg-rose-950/20 text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] focus:outline-none transition-all'
                                : 'w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#ff479b] transition-all'
                            }
                            required
                          />
                          {confirmMismatch && <AlertCircle className="w-4 h-4 absolute right-3.5 text-rose-400" />}
                        </div>
                        {(confirmMismatch || registerSubmitted) && <FieldError message={registerErrors.confirm} />}
                      </div>

                      {/* TOS Agreement */}
                      <div>
                        <div className="flex items-start gap-2.5 pt-1">
                          <input
                            type="checkbox"
                            id="tos-check"
                            checked={tosAgreed}
                            onChange={(e) => setTosAgreed(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded accent-[#ff479b] cursor-pointer"
                          />
                          <label htmlFor="tos-check" className="text-xs text-[#a98891] cursor-pointer">
                            {t('register.tosPrefix')} <a href={VIEW_ROUTES.terms} target="_blank" rel="noopener noreferrer" className="text-[#00d2ff] underline">{t('register.tosTerms')}</a> {t('register.tosAnd')}{' '}
                            <a href={VIEW_ROUTES.privacy} target="_blank" rel="noopener noreferrer" className="text-[#00d2ff] underline">{t('register.tosPrivacy')}</a>{t('register.tosSuffix')}
                          </label>
                        </div>
                        {registerSubmitted && <FieldError message={registerErrors.tos} />}
                      </div>

                      {captchaEnabled && (
                        <div className="space-y-2">
                          <TurnstileWidget
                            ref={captchaRef}
                            siteKey={TURNSTILE_SITE_KEY}
                            theme="dark"
                            language={lang === 'pt' ? 'pt-br' : lang}
                            onToken={(token) => {
                              setCaptchaToken(token);
                              setCaptchaIssue(null);
                            }}
                            onExpire={() => {
                              setCaptchaToken(null);
                              setCaptchaIssue('expired');
                            }}
                            onError={() => {
                              setCaptchaToken(null);
                              setCaptchaIssue('failed');
                            }}
                          />
                          {captchaMissing && (
                            <p
                              data-testid="captcha-hint"
                              role={captchaIssue ? 'alert' : 'status'}
                              className={`text-center text-xs ${captchaIssue ? 'text-rose-400' : 'text-[#a98891]'}`}
                            >
                              {t(captchaHintKey)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Submit CTA */}
                      <button
                        type="submit"
                        disabled={register.isPending || captchaMissing}
                        className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff5959] to-[#ff2e95] text-white font-['Cairo'] font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(255,46,149,0.4)] hover:shadow-[0_0_30px_rgba(255,46,149,0.7)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {register.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('loading.register')}</span>
                          </>
                        ) : (
                          <>
                            <span>{t('register.submit')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-center text-xs text-[#a98891] pt-2">
                      {t('register.haveAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => switchTab('login')}
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
                      <p className="text-xs text-[#a98891] mt-1">{t('login.subtitle')}</p>
                    </div>

                    {login.isError && (
                      <ErrorBanner title={t('errors.title')} message={t(errorMessageKey(login.error))} />
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label htmlFor="login-username" className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                          {t('login.usernameLabel')}
                        </label>
                        <div className="relative flex items-center">
                          <User className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                          <input
                            id="login-username"
                            type="text"
                            autoComplete="username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-4 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#00d2ff] transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="login-password" className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                          {t('login.passwordLabel')}
                        </label>
                        <div className="relative flex items-center">
                          <Key className="w-4 h-4 absolute left-3.5 text-[#a98891]" />
                          <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-[#111319] text-white text-xs font-bold pl-10 pr-10 py-3 rounded-xl border border-[#282a30] focus:outline-none focus:border-[#00d2ff] transition-all"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={login.isPending}
                        className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00d2ff] to-emerald-400 text-black font-['Cairo'] font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {login.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('loading.login')}</span>
                          </>
                        ) : (
                          t('login.submit')
                        )}
                      </button>
                    </form>

                    <p className="text-center text-xs text-[#a98891] pt-2">
                      {t('login.newHere')}{' '}
                      <button
                        type="button"
                        onClick={() => switchTab('register')}
                        className="text-[#ff479b] font-bold hover:underline ml-1"
                      >
                        {t('login.registerLink')}
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

        </section>
      </div>
    </div>
  );
};
