"use client";

import { useEffect, type RefObject } from "react";

const LIVE_AUTH_FIELD_SELECTOR = "[data-live-auth-field]";
const LIVE_AUTH_SUBMIT_SELECTOR = '[data-live-auth-submit="true"]';
const VISIBLE_BOUNDS_PADDING = 16;
const CTA_EXTRA_BOTTOM_GUARD = 16;
const MIN_SUBMIT_SCROLL_SLACK = 48;
const MAX_SUBMIT_SCROLL_SLACK = 132;

type LiveAuthFieldName = "identifier" | "email" | "username" | "password";
type LiveAuthMode = "login" | "register";

type UseLiveWatchGuestAuthViewportArgs = Readonly<{
  enabled: boolean;
  bodyRef: RefObject<HTMLElement | null>;
  rootRef: RefObject<HTMLElement | null>;
}>;

export function useLiveWatchGuestAuthViewport({
  enabled,
  bodyRef,
  rootRef
}: UseLiveWatchGuestAuthViewportArgs) {
  useEffect(() => {
    const rootElement = rootRef.current;
    const bodyElement = bodyRef.current;

    if (!enabled || !rootElement || !bodyElement) {
      return;
    }

    let scheduleVersion = 0;
    let immediateFrameId: number | null = null;
    let settleShortTimeoutId: number | null = null;
    let settleShortFrameId: number | null = null;
    let settleLongTimeoutId: number | null = null;
    let settleLongFrameId: number | null = null;
    let settleFinalTimeoutId: number | null = null;
    let settleFinalFrameId: number | null = null;
    let submitSlackFrameId: number | null = null;
    const initialWindowScrollY = window.scrollY;

    const getActiveBodyElement = () => {
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (!activeElement || !bodyElement.contains(activeElement)) {
        return null;
      }

      return activeElement;
    };

    const restorePageScrollIfNeeded = (activeElement: HTMLElement | null) => {
      if (!activeElement) {
        return;
      }

      if (Math.abs(window.scrollY - initialWindowScrollY) <= 1) {
        return;
      }

      window.scrollTo({
        left: window.scrollX,
        top: initialWindowScrollY,
        behavior: "auto"
      });
    };

    const getSubmitScrollSlack = () => {
      const currentValue = bodyElement.style.getPropertyValue(
        "--live-auth-submit-scroll-slack"
      );

      if (!currentValue) {
        return 0;
      }

      const parsedValue = Number.parseFloat(currentValue);
      return Number.isFinite(parsedValue) ? parsedValue : 0;
    };

    const setSubmitScrollSlack = (reserve: number) => {
      bodyElement.style.setProperty("--live-auth-submit-scroll-slack", `${reserve}px`);
    };

    const clearSubmitScrollSlack = () => {
      bodyElement.style.removeProperty("--live-auth-submit-scroll-slack");
    };

    const isKeyboardLikelyOpen = () => {
      const visualViewport = window.visualViewport;

      if (!visualViewport) {
        return false;
      }

      return visualViewport.height < window.innerHeight - 8;
    };

    const getFieldElement = (formElement: HTMLFormElement, fieldName: LiveAuthFieldName) =>
      formElement.querySelector<HTMLElement>(`[data-live-auth-field="${fieldName}"]`);

    const getFormMode = (formElement: HTMLFormElement): LiveAuthMode | null => {
      const hasIdentifierField = Boolean(getFieldElement(formElement, "identifier"));
      const hasEmailField = Boolean(getFieldElement(formElement, "email"));
      const hasUsernameField = Boolean(getFieldElement(formElement, "username"));

      if (hasIdentifierField) {
        return "login";
      }

      if (hasEmailField && hasUsernameField) {
        return "register";
      }

      return null;
    };

    const getEffectiveVisibleBounds = () => {
      const bodyRect = bodyElement.getBoundingClientRect();
      const visualViewport = window.visualViewport;
      const viewportTop = visualViewport ? visualViewport.offsetTop : bodyRect.top;
      const viewportBottom = visualViewport
        ? visualViewport.offsetTop + visualViewport.height
        : bodyRect.bottom;
      const visibleTop = Math.max(bodyRect.top, viewportTop) + VISIBLE_BOUNDS_PADDING;
      const visibleBottom =
        Math.min(bodyRect.bottom, viewportBottom) - VISIBLE_BOUNDS_PADDING;

      if (visibleBottom <= visibleTop) {
        return null;
      }

      return {
        visibleTop,
        visibleBottom
      };
    };

    const getTargetElements = (
      formElement: HTMLFormElement,
      activeFieldElement: HTMLElement,
      fieldName: LiveAuthFieldName,
      mode: LiveAuthMode | null
    ) => {
      const targetElements: HTMLElement[] = [activeFieldElement];
      const submitButton =
        formElement.querySelector<HTMLButtonElement>(LIVE_AUTH_SUBMIT_SELECTOR);

      if (mode === "register") {
        if (fieldName === "email") {
          const usernameField = getFieldElement(formElement, "username");

          if (usernameField) {
            targetElements.push(usernameField);
          }
        } else if (fieldName === "username") {
          const passwordField = getFieldElement(formElement, "password");

          if (passwordField) {
            targetElements.push(passwordField);
          }
        } else if (fieldName === "password" && submitButton) {
          targetElements.push(submitButton);
        }
      } else if (mode === "login") {
        if (fieldName === "identifier") {
          const passwordField = getFieldElement(formElement, "password");

          if (passwordField) {
            targetElements.push(passwordField);
          }
        } else if (fieldName === "password" && submitButton) {
          targetElements.push(submitButton);
        }
      }

      return {
        includeSubmitTarget:
          submitButton !== null && targetElements.includes(submitButton),
        targetElements
      };
    };

    const clearScheduledCorrections = () => {
      if (immediateFrameId !== null) {
        window.cancelAnimationFrame(immediateFrameId);
        immediateFrameId = null;
      }

      if (settleShortTimeoutId !== null) {
        window.clearTimeout(settleShortTimeoutId);
        settleShortTimeoutId = null;
      }

      if (settleShortFrameId !== null) {
        window.cancelAnimationFrame(settleShortFrameId);
        settleShortFrameId = null;
      }

      if (settleLongTimeoutId !== null) {
        window.clearTimeout(settleLongTimeoutId);
        settleLongTimeoutId = null;
      }

      if (settleLongFrameId !== null) {
        window.cancelAnimationFrame(settleLongFrameId);
        settleLongFrameId = null;
      }

      if (settleFinalTimeoutId !== null) {
        window.clearTimeout(settleFinalTimeoutId);
        settleFinalTimeoutId = null;
      }

      if (settleFinalFrameId !== null) {
        window.cancelAnimationFrame(settleFinalFrameId);
        settleFinalFrameId = null;
      }

      if (submitSlackFrameId !== null) {
        window.cancelAnimationFrame(submitSlackFrameId);
        submitSlackFrameId = null;
      }
    };

    const runCorrectionPass = (token: number) => {
      if (token !== scheduleVersion) {
        return;
      }

      const activeElement = getActiveBodyElement();

      if (!activeElement) {
        clearSubmitScrollSlack();
        return;
      }

      restorePageScrollIfNeeded(activeElement);

      const activeFieldElement = activeElement.closest<HTMLElement>(LIVE_AUTH_FIELD_SELECTOR);
      const formElement = activeElement.closest("form");

      if (
        !activeFieldElement ||
        !formElement ||
        !bodyElement.contains(activeFieldElement)
      ) {
        clearSubmitScrollSlack();
        return;
      }

      const fieldName = activeFieldElement.getAttribute(
        "data-live-auth-field"
      ) as LiveAuthFieldName | null;

      if (!fieldName) {
        clearSubmitScrollSlack();
        return;
      }

      const mode = getFormMode(formElement);
      const { includeSubmitTarget, targetElements } = getTargetElements(
        formElement,
        activeFieldElement,
        fieldName,
        mode
      );
      const keyboardLikelyOpen = isKeyboardLikelyOpen();
      const currentReserve = getSubmitScrollSlack();

      if (!includeSubmitTarget) {
        clearSubmitScrollSlack();
      } else if (!keyboardLikelyOpen) {
        clearSubmitScrollSlack();
      }

      const visibleBounds = getEffectiveVisibleBounds();

      if (!visibleBounds) {
        return;
      }

      let targetTop = Number.POSITIVE_INFINITY;
      let targetBottom = Number.NEGATIVE_INFINITY;

      for (const targetElement of targetElements) {
        const targetRect = targetElement.getBoundingClientRect();
        targetTop = Math.min(targetTop, targetRect.top);
        targetBottom = Math.max(targetBottom, targetRect.bottom);
      }

      if (!Number.isFinite(targetTop) || !Number.isFinite(targetBottom)) {
        clearSubmitScrollSlack();
        return;
      }

      const { visibleTop, visibleBottom } = visibleBounds;
      const submitBottomGuard = includeSubmitTarget ? CTA_EXTRA_BOTTOM_GUARD : 0;
      const guardedVisibleBottom = visibleBottom - submitBottomGuard;

      if (guardedVisibleBottom <= visibleTop) {
        return;
      }

      const maxScrollTop = Math.max(
        0,
        bodyElement.scrollHeight - bodyElement.clientHeight
      );
      const requiredDelta = Math.max(
        0,
        targetBottom - visibleBottom + submitBottomGuard
      );
      const remainingScrollCapacity = Math.max(
        0,
        maxScrollTop - bodyElement.scrollTop
      );
      const needsSubmitSlack =
        includeSubmitTarget &&
        keyboardLikelyOpen &&
        requiredDelta > 0 &&
        remainingScrollCapacity < requiredDelta;

      if (needsSubmitSlack) {
        const neededAdditionalReserve = requiredDelta - remainingScrollCapacity;
        const reserve = Math.min(
          MAX_SUBMIT_SCROLL_SLACK,
          Math.max(
            MIN_SUBMIT_SCROLL_SLACK,
            currentReserve + neededAdditionalReserve + submitBottomGuard
          )
        );

        if (currentReserve < reserve) {
          setSubmitScrollSlack(reserve);

          if (submitSlackFrameId !== null) {
            window.cancelAnimationFrame(submitSlackFrameId);
          }

          submitSlackFrameId = window.requestAnimationFrame(() => {
            submitSlackFrameId = null;
            runCorrectionPass(token);
          });

          return;
        }
      }

      if (targetTop >= visibleTop && targetBottom <= guardedVisibleBottom) {
        return;
      }

      let nextScrollTop = bodyElement.scrollTop;

      if (targetBottom > guardedVisibleBottom) {
        nextScrollTop += targetBottom - guardedVisibleBottom;
      } else if (targetTop < visibleTop) {
        nextScrollTop -= visibleTop - targetTop;
      }

      bodyElement.scrollTop = Math.min(
        Math.max(0, bodyElement.scrollHeight - bodyElement.clientHeight),
        Math.max(0, nextScrollTop)
      );
    };

    const scheduleViewportSync = () => {
      scheduleVersion += 1;
      const token = scheduleVersion;
      clearScheduledCorrections();

      immediateFrameId = window.requestAnimationFrame(() => {
        immediateFrameId = null;
        runCorrectionPass(token);
      });

      settleShortTimeoutId = window.setTimeout(() => {
        settleShortTimeoutId = null;
        settleShortFrameId = window.requestAnimationFrame(() => {
          settleShortFrameId = null;
          runCorrectionPass(token);
        });
      }, 80);

      settleLongTimeoutId = window.setTimeout(() => {
        settleLongTimeoutId = null;
        settleLongFrameId = window.requestAnimationFrame(() => {
          settleLongFrameId = null;
          runCorrectionPass(token);
        });
      }, 180);

      settleFinalTimeoutId = window.setTimeout(() => {
        settleFinalTimeoutId = null;
        settleFinalFrameId = window.requestAnimationFrame(() => {
          settleFinalFrameId = null;
          runCorrectionPass(token);
        });
      }, 320);
    };

    const handleScopedInput = (event: Event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement) || !bodyElement.contains(target)) {
        return;
      }

      scheduleViewportSync();
    };

    const visualViewport = window.visualViewport;

    scheduleViewportSync();
    window.addEventListener("resize", scheduleViewportSync);
    rootElement.addEventListener("focusin", scheduleViewportSync);
    bodyElement.addEventListener("input", handleScopedInput);

    if (visualViewport) {
      visualViewport.addEventListener("resize", scheduleViewportSync);
    }

    return () => {
      window.removeEventListener("resize", scheduleViewportSync);
      rootElement.removeEventListener("focusin", scheduleViewportSync);
      bodyElement.removeEventListener("input", handleScopedInput);

      if (visualViewport) {
        visualViewport.removeEventListener("resize", scheduleViewportSync);
      }

      scheduleVersion += 1;
      clearScheduledCorrections();
      clearSubmitScrollSlack();
    };
  }, [bodyRef, enabled, rootRef]);
}
