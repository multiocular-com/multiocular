declare const __brand: unique symbol

// Avoid using string for everything. With this fake __brand key we are adding
// branding types to TypeScript (like ID, Email, FilePath instead of string).
export type Brand<T, B> = { [__brand]: B } & T
