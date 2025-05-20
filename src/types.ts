export type Callback<A extends any[] = never[], R = void> = (...args: A) => R;

export type Emission = {
  change: string | undefined;
};
