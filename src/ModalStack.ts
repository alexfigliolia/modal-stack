import { QuickStack } from "@figliolia/data-structures";
import { EventEmitter } from "@figliolia/event-emitter";
import type { PopoverToggle } from "./PopoverToggle";
import type { Emission } from "./types";

/**
 * Modal Stack
 *
 * A utility for managing UI's with multiple modals,
 * dialogs, or drawers
 */
export class ModalStack {
  private static storage = new QuickStack<PopoverToggle<any>>();
  public static readonly emitter = new EventEmitter<Emission>();

  /**
   * Push
   *
   * Add's a modal or popover toggle instance to the stack. Returns
   * a unique identifier that can be passed to `ModalStack.delete()`
   * to remove the entry
   */
  public static push(instance: PopoverToggle<any>) {
    const ID = this.storage.push(instance);
    this.emit();
    if (this.totalEntries === 1) {
      window.addEventListener("keydown", this.keydown);
    }
    return ID;
  }

  /**
   * Pop
   *
   * Closes the latest modal on the stack and removes its entry
   */
  public static pop() {
    const toggle = this.storage.pop();
    if (toggle) {
      toggle.close();
      this.emit();
      if (!this.totalEntries) {
        window.removeEventListener("keydown", this.keydown);
      }
    }
  }

  /**
   * Peek
   *
   * Returns the toggle at the top of the stack
   */
  public static peek() {
    return this.storage.peek()?.[1];
  }

  /**
   * Delete
   *
   * Delete an entry from the stack by ID
   */
  public static delete(ID: string) {
    const deleted = this.storage.delete(ID);
    if (!deleted) {
      return deleted;
    }
    this.emit();
    if (!this.totalEntries) {
      window.removeEventListener("keydown", this.keydown);
    }
    return deleted;
  }

  /**
   * Close All
   *
   * Removes each entry from the stack and closes the
   * associated UI
   */
  public static closeAll() {
    while (this.length) {
      this.pop();
    }
  }

  /**
   * Total Entries
   *
   * Returns the number of entries on the stack
   */
  public static get totalEntries() {
    return this.storage.length;
  }

  static *[Symbol.iterator]() {
    for (const entry of this.storage) {
      yield entry;
    }
  }

  private static keydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.pop();
    }
  };

  private static emit(top = this.storage.peek()?.[1]) {
    this.emitter.emit("change", top);
  }
}
