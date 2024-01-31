import { signal } from "@preact/signals";

export const email = signal<string>("");
export const password = signal<string>("");
export const registrationToken = signal<string>("");
export const authenticationToken = signal<string>("");
export const hasError = signal<boolean>(false);
export const isAuthenticated = signal<boolean>(false);
export const isRegistered = signal<boolean>(false);
