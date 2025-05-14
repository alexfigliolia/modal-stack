import type { ModalStack } from "./ModalStack";
import type { Callback } from "./types";

/**
 * Modal Toggle
 *
 * An interface to simply managing a `ModalStack`
 * entry.
 */
export class ModalToggle<T extends any[] = never[]> {
  public ID?: string;
  public isOpen = false;
  private closer: Callback;
  private opener: Callback<T>;
  private stack: ModalStack;
  constructor(opener: Callback<T>, closer: Callback, stack: ModalStack) {
    this.stack = stack;
    this.opener = opener;
    this.closer = closer;
  }

  /**
   * Open
   *
   * Invokes the opener function passed through the constructor
   * and adds the toggle's entry to the stack
   */
  public open = (...args: T) => {
    this.isOpen = true;
    this.ID = this.stack.push(this.close);
    this.opener(...args);
  };

  /**
   * Close
   *
   * Invokes the closer function passed through the constructor
   * and removes the toggle's entry from the stack
   */
  public close = () => {
    if (this.ID) {
      this.stack.delete(this.ID);
      this.ID = undefined;
    }
    this.closer();
    this.isOpen = false;
  };

  /**
   * Update
   *
   * If your opener/closer functions passed through the
   * constructor are subject to change at runtime, use this
   * method to update them
   */
  public update(opener: Callback<T>, closer: Callback) {
    this.opener = opener;
    this.closer = closer;
  }
}
