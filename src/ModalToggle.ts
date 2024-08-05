import type { ModalStack } from "./ModalStack";
import type { Callback } from "./types";

export class ModalToggle<T extends any[]> {
  public ID?: string;
  private closer: Callback;
  private opener: Callback<T>;
  private stack: ModalStack;
  constructor(opener: Callback<T>, closer: Callback, stack: ModalStack) {
    this.stack = stack;
    this.opener = opener;
    this.closer = closer;
  }

  public open = (...args: T) => {
    this.ID = this.stack.push(this.close);
    this.opener(...args);
  };

  public close = () => {
    if (this.ID) {
      this.stack.delete(this.ID);
      this.ID = undefined;
    }
    this.closer();
  };
}
