import { FocusTrap } from "./FocusTrap";
import { ModalStack } from "./ModalStack";
import { PopoverToggle } from "./PopoverToggle";
import type { Callback } from "./types";

/**
 * Modal Toggle
 *
 * A wrapper around the open and close logic of a modal
 * window. By using a `ModalToggle`, you get:
 *
 * 1. Escape key logic for closing the top most modal
 * 2. Focus Trapping and returning focus to the trigger element
 * 3. A collision free experience when multiple modals are open
 *
 * ```typescript
 * const myModal = document.getElementById('myModal');
 *
 * const openModal = () => {
 *  myModal.style.display = 'block;
 *  myModal.setAttribute('aria-hidden', false);
 * }
 *
 * const closeModal = () => {
 *  myModal.style.display = 'none;
 *  myModal.setAttribute('aria-hidden', true);
 * }
 *
 * const toggle = new ModalToggle(openModal, closeModal, myModal);
 *
 * // to open the modal and trap focus
 * toggle.open();
 * // to close the modal and return focus to the trigger
 * toggle.close();
 * ```
 */
export class ModalToggle<T extends any[] = never[]> extends PopoverToggle<T> {
  private superOpen: Callback<T> = this.open;
  private superClose: Callback<[boolean]> = this.close;
  private subscriptionID?: string;
  private FocusTrap: FocusTrap | null = null;
  private trapNode: HTMLElement | null = null;
  constructor(
    opener: Callback<T>,
    closer: Callback,
    trapNode: HTMLElement | null = null,
  ) {
    super(opener, closer);
    this.trapNode = trapNode;
  }

  /**
   * Open
   *
   * Invokes the opener function passed through the constructor
   * and adds the toggle's entry to the stack
   */
  public open = (...args: T) => {
    this.superOpen(...args);
    this.subscribeFocusTrapping();
  };

  /**
   * Close
   *
   * Invokes the closer function passed through the constructor
   * and removes the toggle's entry from the stack
   */
  public override close = () => {
    this.superClose(true);
    this.unsubscribeFocusTrapping();
  };

  /**
   * Register Trap Node
   *
   * Registers a DOM element for focus to be trapped within
   * when your modal opens
   */
  public registerTrapNode = (element: HTMLElement | null) => {
    this.trapNode = element;
    if (this.isOpen) {
      this.subscribeFocusTrapping();
    }
  };

  /**
   * Destroy
   *
   * If your modal unmounts suddenly or an error is thrown
   * you can cleanup related toggle logic by using this
   * method
   */
  public override destroy() {
    super.destroy();
    this.unsubscribeFocusTrapping();
  }

  private subscribeFocusTrapping() {
    if (this.trapNode && !this.subscriptionID) {
      this.subscriptionID = ModalStack.emitter.on("change", this.onStackChange);
      this.FocusTrap = new FocusTrap(this.trapNode);
    }
  }

  private unsubscribeFocusTrapping() {
    if (this.subscriptionID) {
      ModalStack.emitter.off("change", this.subscriptionID);
      this.subscriptionID = undefined;
      this.FocusTrap?.pause?.();
      this.FocusTrap = null;
    }
  }

  private readonly onStackChange = () => {
    for (const [_, entry] of ModalStack) {
      if (entry instanceof ModalToggle && entry !== this) {
        return this.FocusTrap?.pause?.();
      }
      if (entry === this) {
        return this.FocusTrap?.resume?.();
      }
    }
  };
}
