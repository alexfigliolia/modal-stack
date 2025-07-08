import { PopoverToggle } from "./PopoverToggle";
import type { Callback } from "./types";
import { useToggle } from "./useToggle";

export const usePopoverToggle = <T extends any[] = never[]>(
  open: Callback<T>,
  close: Callback,
) => {
  return useToggle(open, close, PopoverToggle<T>);
};
