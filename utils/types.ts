declare const __brand: unique symbol

// Avoid using string for everything. With this fake __brand key we are adding
// branding types to TypeScript (like ID, Email, FilePath instead of string).
export type Brand<T, B> = { [__brand]: B } & T

// Utility type to remove branding and get the underlying type
export type Debrand<T> = T extends (infer U)[]
  ? Debrand<U>[]
  : T extends { [__brand]: any }
    ? { [K in keyof Omit<T, typeof __brand>]: Debrand<T[K]> }
    : T extends object
      ? { [K in keyof T]: Debrand<T[K]> }
      : T
