import { useEffect, useRef } from "react";

export interface TurnstileFieldProps {
  onToken: (token: string) => void;
}

export function TurnstileField({ onToken }: TurnstileFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

    // No sitekey configured — bypass CAPTCHA so the form remains usable.
    if (!sitekey) {
      onTokenRef.current("no-captcha");
      return;
    }

    if (!ref.current) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, { sitekey, callback: () => onTokenRef.current(sitekey) });
      }
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []); // stable — sitekey is a build-time constant, onToken is accessed via ref

  // Don't render the widget container when CAPTCHA is not configured.
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  if (!sitekey) return null;

  return <div ref={ref} className="captcha-field" aria-label="Spam protection" />;
}
