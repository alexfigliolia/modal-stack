import { QuickStack } from "@figliolia/data-structures";
import { ModalToggle } from "./ModalToggle";
import type { Callback } from "./types";

/**
 * Modal Stack
 *
 * A utility for managing UI's with multiple modals,
 * dialogs, or drawers
 */
export class ModalStack extends QuickStack<Callback> {
  /**
   * Push
   *
   * Add's a modal's close method to the stack. Returns
   * a unique identifier that can be passed to `ModalStack.delete()`
   * to remove the entry manually
   */
  public override push(closerFN: Callback) {
    const ID = super.push(closerFN);
    if (super.length === 1) {
      window.addEventListener("keydown", this.keydown);
    }
    return ID;
  }

  /**
   * Pop
   *
   * Closes the latest modal on the stack and
   * removes its entry
   */
  public override pop() {
    const callback = super.pop();
    callback?.();
    if (!super.length) {
      window.removeEventListener("keydown", this.keydown);
    }
    return callback;
  }

  /**
   * Create
   *
   * A toggle creator that'll handle managing stack
   * entries for given set of open/close functionality
   */
  public create<T extends any[]>(opener: Callback<T>, closer: Callback) {
    return new ModalToggle<T>(opener, closer, this);
  }

  /**
   * Close All
   *
   * Removes each entry from the stack and closes the
   * associated UI
   */
  public closeAll() {
    while (this.length) {
      this.pop();
    }
  }

  private keydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.pop();
    }
  };
}
