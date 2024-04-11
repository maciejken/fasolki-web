import { signal } from "@preact/signals";

export const firstName = signal<string>("");
export const lastName = signal<string>("");
export const phone = signal<string>("");
export const hasError = signal<boolean>(false);
