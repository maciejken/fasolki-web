import { signal } from "@preact/signals";

export const basicAuth = signal<string>("");
export const isAuthenticated = signal<boolean>(false);
