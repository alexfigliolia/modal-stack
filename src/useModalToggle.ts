import { useEffect } from "react";
import { useController } from "@figliolia/react-hooks";
import { ModalToggle } from "./ModalToggle";
import type { Callback } from "./types";

export const useModalToggle = <T extends any[] = never[]>(
  open: Callback<T>,
  close: Callback,
) => {
  const toggle = useController(new ModalToggle(open, close));

  useEffect(() => {
    toggle.update(open, close);
  }, [open, close, toggle]);

  return toggle;
};
