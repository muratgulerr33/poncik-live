"use client";

import { useEffect, useState } from "react";

import {
  readStudioBrowserCapabilityState,
  type StudioBrowserCapabilityState
} from "../_adapters/studio-browser-capability-adapter";
import { STUDIO_COPY } from "../_lib/studio-copy";
import styles from "./studio.module.css";

function getCapabilityCopy(state: StudioBrowserCapabilityState) {
  if (state === "unsupported") {
    return {
      title: STUDIO_COPY.unsupportedTitle,
      body: STUDIO_COPY.unsupportedBody
    };
  }

  if (state === "not_ready") {
    return {
      title: STUDIO_COPY.notReadyTitle,
      body: STUDIO_COPY.notReadyBody
    };
  }

  if (state === "degraded") {
    return {
      title: STUDIO_COPY.capabilityDegradedTitle,
      body: STUDIO_COPY.capabilityDegradedBody
    };
  }

  return {
    title: STUDIO_COPY.readyLaterTitle,
    body: STUDIO_COPY.readyLaterBody
  };
}

export function StudioPermissionNotice() {
  const [state, setState] = useState<StudioBrowserCapabilityState>("not_ready");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setState(readStudioBrowserCapabilityState());
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const copy = getCapabilityCopy(state);

  return (
    <section className={styles.notice}>
      <h3 className={styles.noticeTitle}>{copy.title}</h3>
      <p className={styles.noticeBody}>{copy.body}</p>
    </section>
  );
}
