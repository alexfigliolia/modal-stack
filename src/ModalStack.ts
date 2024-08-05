import { ModalToggle } from "./ModalToggle";
import { QuickStack } from "./QuickStack";
import type { Callback } from "./types";

export class ModalStack extends QuickStack<Callback> {
  public override push(item: Callback) {
    const ID = super.push(item);
    if (super.length === 1) {
      window.addEventListener("keydown", this.keydown);
    }
    return ID;
  }

  public override pop() {
    const callback = super.pop();
    callback?.();
    if (!super.length) {
      window.removeEventListener("keydown", this.keydown);
    }
    return callback;
  }

  public create<T extends any[]>(opener: Callback<T>, closer: Callback) {
    return new ModalToggle<T>(opener, closer, this);
  }

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
