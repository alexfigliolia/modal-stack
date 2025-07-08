import { ModalToggle } from "./ModalToggle";
import type { Callback } from "./types";
import { useToggle } from "./useToggle";

export const useModalToggle = <T extends any[] = never[]>(
  open: Callback<T>,
  close: Callback,
) => {
  return useToggle(open, close, ModalToggle<T>);
};
