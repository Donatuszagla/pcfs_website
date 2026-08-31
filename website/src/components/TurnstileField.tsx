import { useEffect, useRef } from "react";

export interface TurnstileFieldProps {
  onToken: (token: string) => void;
}

export function TurnstileField({ onToken }: TurnstileFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    if (!sitekey || !ref.current) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, { sitekey, callback: onToken });
      }
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [onToken]);
  return <div ref={ref} className="captcha-field" aria-label="Spam protection" />;
}
