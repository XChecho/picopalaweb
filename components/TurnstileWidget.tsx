'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Script from 'next/script';

interface ITurnstileRenderOptions {
  sitekey: string;
  theme: 'light' | 'dark' | 'auto';
  language?: string;
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
}

interface ITurnstileApi {
  render: (container: HTMLElement, options: ITurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: ITurnstileApi;
  }
}

export interface ITurnstileHandle {
  /** Requests a fresh token. Tokens are single use: call after every submit that failed. */
  reset: () => void;
}

interface ITurnstileWidgetProps {
  siteKey: string;
  theme?: 'light' | 'dark' | 'auto';
  /** Cloudflare language code (e.g. "es", "pt-br"). Defaults to automatic detection. */
  language?: string;
  onToken: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
  ref?: React.Ref<ITurnstileHandle>;
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export function TurnstileWidget({
  siteKey,
  theme = 'dark',
  language,
  onToken,
  onExpire,
  onError,
  ref,
}: ITurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Latest callbacks without re-rendering (and so re-creating) the widget.
  const handlers = useRef({ onToken, onExpire, onError });
  useEffect(() => {
    handlers.current = { onToken, onExpire, onError };
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
    },
  }));

  const markReady = useCallback(() => setScriptReady(true), []);

  // The script may already be loaded from a previous mount of this component.
  useEffect(() => {
    if (window.turnstile) markReady();
  }, [markReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!scriptReady || !container || !window.turnstile) return;

    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      theme,
      language,
      callback: (token) => handlers.current.onToken(token),
      'expired-callback': () => handlers.current.onExpire(),
      'error-callback': () => handlers.current.onError(),
    });
    widgetIdRef.current = widgetId;

    return () => {
      window.turnstile?.remove(widgetId);
      widgetIdRef.current = null;
    };
  }, [scriptReady, siteKey, theme, language]);

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={markReady} />
      <div ref={containerRef} data-testid="turnstile-widget" className="flex justify-center min-h-[65px]" />
    </>
  );
}
