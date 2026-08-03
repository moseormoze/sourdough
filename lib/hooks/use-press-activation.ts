"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
} from "react";

const DRAG_CANCEL_THRESHOLD_PX = 5;
const CLICK_SUPPRESSION_MS = 200;

interface PointerState {
  active: boolean;
  startX: number;
  startY: number;
  suppressPhysicalClick: boolean;
}

interface PressActivationProps<T extends HTMLElement> {
  onClick: MouseEventHandler<T>;
  onPointerDown: PointerEventHandler<T>;
  onPointerMove: PointerEventHandler<T>;
  onPointerUp: PointerEventHandler<T>;
  onPointerCancel: PointerEventHandler<T>;
  onPointerLeave: PointerEventHandler<T>;
  onBlur: FocusEventHandler<T>;
}

export function usePressActivation<T extends HTMLElement>(onActivate?: () => void): {
  isPressed: boolean;
  pressProps: PressActivationProps<T>;
} {
  const [isPressed, setIsPressed] = useState(false);
  const pointer = useRef<PointerState>({
    active: false,
    startX: 0,
    startY: 0,
    suppressPhysicalClick: false,
  });
  const suppressionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSuppressionTimer = useCallback(() => {
    if (suppressionTimer.current === null) return;
    clearTimeout(suppressionTimer.current);
    suppressionTimer.current = null;
  }, []);

  const suppressPhysicalClick = useCallback(() => {
    clearSuppressionTimer();
    pointer.current.suppressPhysicalClick = true;
    suppressionTimer.current = setTimeout(() => {
      pointer.current.suppressPhysicalClick = false;
      suppressionTimer.current = null;
    }, CLICK_SUPPRESSION_MS);
  }, [clearSuppressionTimer]);

  const cancelActivePress = useCallback(() => {
    if (!pointer.current.active) return;
    pointer.current.active = false;
    setIsPressed(false);
    suppressPhysicalClick();
  }, [suppressPhysicalClick]);

  const onPointerDown = useCallback<PointerEventHandler<T>>((event) => {
    if (event.button !== 0) return;
    clearSuppressionTimer();
    pointer.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      suppressPhysicalClick: false,
    };
    setIsPressed(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [clearSuppressionTimer]);

  const onPointerMove = useCallback<PointerEventHandler<T>>((event) => {
    if (!pointer.current.active) return;
    const dx = Math.abs(event.clientX - pointer.current.startX);
    const dy = Math.abs(event.clientY - pointer.current.startY);
    if (dx <= DRAG_CANCEL_THRESHOLD_PX && dy <= DRAG_CANCEL_THRESHOLD_PX) return;
    cancelActivePress();
  }, [cancelActivePress]);

  const onPointerUp = useCallback<PointerEventHandler<T>>((event) => {
    pointer.current.active = false;
    setIsPressed(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  }, []);

  const onClick = useCallback<MouseEventHandler<T>>((event) => {
    if (event.detail !== 0 && pointer.current.suppressPhysicalClick) {
      pointer.current.suppressPhysicalClick = false;
      clearSuppressionTimer();
      event.preventDefault();
      return;
    }
    pointer.current.suppressPhysicalClick = false;
    clearSuppressionTimer();
    onActivate?.();
  }, [clearSuppressionTimer, onActivate]);

  useEffect(() => () => {
    clearSuppressionTimer();
    pointer.current.active = false;
    pointer.current.suppressPhysicalClick = false;
  }, [clearSuppressionTimer]);

  return {
    isPressed,
    pressProps: {
      onClick,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: cancelActivePress,
      onPointerLeave: cancelActivePress,
      onBlur: cancelActivePress,
    },
  };
}
