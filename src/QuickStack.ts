import { AutoIncrementingID } from "@figliolia/event-emitter";

export class QuickStack<T> {
  public storage = new Map<string, T>();
  private IDs = new AutoIncrementingID();

  public push(item: T) {
    const ID = this.IDs.get();
    this.storage.set(ID, item);
    return ID;
  }

  public get length() {
    return this.storage.size;
  }

  public pop() {
    const last = Array.from(this.storage.keys()).pop();
    if (!last) {
      return;
    }
    const item = this.storage.get(last);
    this.delete(last);
    return item;
  }

  public delete(key: string) {
    return this.storage.delete(key);
  }
}
