export const apiUrl = Deno.env.get("API_URL");
export const appUrl = Deno.env.get("APP_URL");

console.debug("API_URL:", apiUrl);
console.debug("APP_URL:", appUrl);
