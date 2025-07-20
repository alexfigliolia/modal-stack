import type { PopoverToggle } from "./PopoverToggle";

export type Callback<A extends any[] = never[], R = void> = (...args: A) => R;

export type Emission = {
  change: PopoverToggle | undefined;
};
