/**
 * Focus Trap
 *
 * A Focus trapper for modal UI elements.
 *
 * ```typescript
 * const myModal = document.getElementById('myModal');
 * // create a trap
 * const focusTrap = new FocusTrap(myModal);
 * // to pause focus trapping
 * focusTrap.pause();
 * // to destroy the trap permanently
 * focusTrap.destroy()
 * ```
 */
export class FocusTrap {
  public focusIndex = 0;
  private active = false;
  private shifting = false;
  private trapNode: HTMLElement;
  public static readonly FOCUSABLE_SELECTORS =
    "a[href], button, input, textarea, iframe, select, details, [tabindex]:not([tabindex='-1']";
  constructor(trapNode: HTMLElement) {
    this.trapNode = trapNode;
    this.resume();
  }

  /**
   * Resume
   *
   * If paused, the focus trap will reactivate trapping focus
   * within the specified dom node
   */
  public resume() {
    if (!this.active) {
      this.active = true;
      document.addEventListener("keyup", this.onKeyUp);
      document.addEventListener("keydown", this.onKeyDown);
      document.addEventListener("click", this.onClick);
    }
  }

  /**
   * Resume
   *
   * If active, the focus trap will discontinue trapping focus
   * within the specified dom node
   */
  public pause() {
    if (this.active) {
      this.active = false;
      document.removeEventListener("keyup", this.onKeyUp);
      document.removeEventListener("keydown", this.onKeyDown);
      document.removeEventListener("click", this.onClick);
    }
  }

  /**
   * Destroy
   *
   * Deactivates the focus trap permanently
   */
  public destroy() {
    this.pause();
    this.focusIndex = 0;
  }

  private readonly onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      this.shifting = false;
    }
  };

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      this.shifting = true;
      return;
    }
    if (e.key !== "Tab") {
      return;
    }
    e.preventDefault();
    if (!this.trapNode) {
      return;
    }
    this.onTab(this.trapNode);
  };

  private readonly onClick = (e: MouseEvent) => {
    if (!this.trapNode || !this.trapNode.contains(e.target as HTMLElement)) {
      return;
    }
    const nodes = FocusTrap.getFocusableNodes(this.trapNode);
    const idx = nodes.indexOf(e.target as HTMLElement);
    if (idx !== -1) {
      this.focusIndex = idx;
    }
  };

  private onTab(container: HTMLElement) {
    const nodes = FocusTrap.getFocusableNodes(container);
    const currentIndex = nodes.indexOf(document.activeElement as HTMLElement);
    if (currentIndex !== -1) {
      if (this.shifting) {
        const next = currentIndex - 1;
        this.focusIndex = next < 0 ? nodes.length - 1 : next;
      } else {
        const next = currentIndex + 1;
        this.focusIndex = next >= nodes.length ? 0 : next;
      }
    } else {
      if (this.shifting) {
        const next = this.focusIndex - 1;
        this.focusIndex = next < 0 ? nodes.length - 1 : next;
      } else {
        const next = this.focusIndex + 1;
        this.focusIndex = next >= nodes.length ? 0 : next;
      }
    }
    nodes[this.focusIndex].focus();
  }

  public static getFocusableNodes(trapNode: HTMLElement | null | Document) {
    if (!trapNode) {
      return [];
    }
    const nodes: Element[] = [];
    if (trapNode && trapNode instanceof HTMLElement) {
      const tabIndex = parseInt(trapNode.getAttribute("tabindex") ?? "-1");
      if (tabIndex > -1) {
        nodes.push(trapNode);
      }
    }
    nodes.push(...trapNode.querySelectorAll(FocusTrap.FOCUSABLE_SELECTORS));
    const focusableNodes = nodes.filter(
      node =>
        node.getAttribute("tabindex") !== "-1" &&
        node.getAttribute("disabled") !== "true" &&
        node.getAttribute("aria-hidden") !== "true",
    ) as HTMLElement[];
    const { length } = focusableNodes;
    const map = new Map<number, HTMLElement[]>();
    for (let i = 0; i < length; i++) {
      const node = focusableNodes[i];
      if (node.tagName === "IFRAME") {
        const iframe = node as HTMLIFrameElement;
        let iframeNodes: HTMLElement[] = [];
        if (iframe.contentDocument) {
          iframeNodes = this.getFocusableNodes(iframe.contentDocument);
        }
        map.set(i, iframeNodes);
      }
    }
    const entries = Array.from(map.entries());
    while (entries.length) {
      const [index, elements] = entries.pop()!;
      focusableNodes.splice(index, 1, ...elements);
    }
    return focusableNodes;
  }
}
