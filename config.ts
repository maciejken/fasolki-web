export const apiUrl = Deno.env.get("API_URL");
export const targetOrigin = Deno.env.get("TARGET_ORIGIN");

console.debug("API_URL:", apiUrl);
console.debug("TARGET_ORIGIN:", targetOrigin);
