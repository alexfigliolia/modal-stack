import { useEffect } from "react";
import { useController } from "@figliolia/react-hooks";
import type { PopoverToggle } from "./PopoverToggle";
import type { Callback } from "./types";

export const useToggle = <
  V extends typeof PopoverToggle<T>,
  T extends any[] = never[],
>(
  open: Callback<T>,
  close: Callback,
  Toggle: V,
) => {
  const toggle = useController(new Toggle(open, close));

  useEffect(() => {
    toggle.update(open, close);
  }, [open, close, toggle]);

  useEffect(() => {
    return () => {
      toggle.destroy();
    };
  }, [toggle]);

  return toggle as InstanceType<V>;
};
