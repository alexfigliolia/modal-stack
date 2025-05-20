import type { RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import { FocusTrap } from "./FocusTrap";

export const useFocusTrap = <T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<FocusTrap | null>,
] => {
  const node = useRef<T>(null);
  const trapRef = useRef<FocusTrap | null>(null);

  useLayoutEffect(() => {
    if (!node.current) {
      return;
    }
    const trap = new FocusTrap(node.current);
    trapRef.current = trap;
    return () => {
      trap.destroy();
    };
  }, []);

  return [node, trapRef];
};
