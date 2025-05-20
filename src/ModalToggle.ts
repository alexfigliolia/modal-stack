import { FocusTrap } from "./FocusTrap";
import { ModalStack } from "./ModalStack";
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
export class ModalToggle<T extends any[] = never[]> {
  public ID?: string;
  public isOpen = false;
  private closer: Callback;
  private opener: Callback<T>;
  private subscriptionID?: string;
  private FocusTrap: FocusTrap | null = null;
  private trigger: HTMLElement | null = null;
  private trapNode: HTMLElement | null = null;
  constructor(
    opener: Callback<T>,
    closer: Callback,
    trapNode: HTMLElement | null = null,
  ) {
    this.opener = opener;
    this.closer = closer;
    this.trapNode = trapNode;
  }

  /**
   * Open
   *
   * Invokes the opener function passed through the constructor
   * and adds the toggle's entry to the stack
   */
  public open = (...args: T) => {
    this.trigger = (document?.activeElement as HTMLElement) ?? undefined;
    this.isOpen = true;
    this.ID = ModalStack.push(this.close);
    this.opener(...args);
    this.subscribeFocusTrapping();
  };

  /**
   * Close
   *
   * Invokes the closer function passed through the constructor
   * and removes the toggle's entry from the stack
   */
  public close = () => {
    this.isOpen = false;
    if (this.ID) {
      ModalStack.delete(this.ID);
      this.ID = undefined;
    }
    this.closer();
    this.trigger?.focus?.();
    this.trigger = null;
    this.unsubscribeFocusTrapping();
  };

  /**
   * Close
   *
   * Invokes the closer function passed through the constructor
   * and removes the toggle's entry from the stack
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
  public destroy() {
    this.isOpen = false;
    if (this.ID) {
      ModalStack.delete(this.ID);
      this.ID = undefined;
    }
    this.closer();
    this.trigger = null;
    this.unsubscribeFocusTrapping();
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
   * Close All Modals
   *
   * Closes all open modals
   */
  public static closeAllModals() {
    ModalStack.closeAll();
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

  private readonly onStackChange = (top: string | undefined) => {
    if (this.ID && top === this.ID) {
      this.FocusTrap?.resume?.();
    } else {
      this.FocusTrap?.pause?.();
    }
  };
}
