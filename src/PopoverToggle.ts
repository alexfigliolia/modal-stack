import { ModalStack } from "./ModalStack";
import type { Callback } from "./types";

/**
 * Popover Toggle
 *
 * A wrapper around the open and close logic of a popover
 * element. By using a `PopoverToggle`, you get:
 *
 * 1. Escape key logic for closing the top most popover
 * 2. A collision free experience when multiple popovers are open
 *
 * ```typescript
 * const myPopover = document.getElementById('myPopover');
 *
 * const openPopover = () => {
 *  myPopover.style.display = 'block;
 *  myPopover.setAttribute('aria-hidden', false);
 * }
 *
 * const closePopover = () => {
 *  myPopover.style.display = 'none;
 *  myPopover.setAttribute('aria-hidden', true);
 * }
 *
 * const toggle = new PopoverToggle(openPopover, closePopover);
 *
 * // to open the popover
 * toggle.open();
 * // to close the popover and return focus to the trigger
 * toggle.close();
 * // to close the popover without returning focus to the trigger
 * toggle.close(false);
 * ```
 */
export class PopoverToggle<T extends any[] = never[]> {
  public ID?: string;
  public isOpen = false;
  protected closer: Callback;
  protected opener: Callback<T>;
  protected trigger: HTMLElement | null = null;
  constructor(opener: Callback<T>, closer: Callback) {
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
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.trigger = (document?.activeElement as HTMLElement) ?? undefined;
    this.ID = ModalStack.push(this);
    this.opener(...args);
  };

  /**
   * Close
   *
   * Invokes the closer function passed through the constructor
   * and removes the toggle's entry from the stack
   */
  public close = (returnFocus = true) => {
    if (!this.isOpen) {
      return;
    }
    this.invokeClosing();
    if (returnFocus) {
      this.trigger?.focus?.();
      this.trigger = null;
    }
  };

  /**
   * Destroy
   *
   * If your popover unmounts suddenly or an error is thrown
   * you can cleanup related toggle logic by using this
   * method
   */
  public destroy() {
    if (!this.isOpen) {
      return;
    }
    this.invokeClosing();
    this.trigger = null;
  }

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

  /**
   * Close All Open Toggles
   *
   * Closes all open modals/popovers
   */
  public static closeAll() {
    ModalStack.closeAll();
  }

  private invokeClosing() {
    this.isOpen = false;
    if (this.ID) {
      ModalStack.delete(this.ID);
      this.ID = undefined;
    }
    this.closer();
  }
}
