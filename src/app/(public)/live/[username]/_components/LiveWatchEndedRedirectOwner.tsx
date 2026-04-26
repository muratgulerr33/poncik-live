"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const ENDED_REDIRECT_DELAY_MS = 3000;

export function LiveWatchEndedRedirectOwner() {
  const redirectTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (redirectTimeoutRef.current !== null) {
      return;
    }

    redirectTimeoutRef.current = window.setTimeout(() => {
      router.replace("/");
    }, ENDED_REDIRECT_DELAY_MS);

    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [router]);

  return null;
}
