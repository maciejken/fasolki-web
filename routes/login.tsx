import { apiUrl } from "../config.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getAuthenticationOptions, getAuthenticationToken, getBasicAuth } from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import Authentication from "../islands/Authentication.tsx";
import { email, password, authenticationToken, hasError, isAuthenticated } from "../utils/auth/state.ts";

export const handler: Handlers = {
  async POST(req, ctx): Response {
    const data = new URLSearchParams(await req.text());
    email.value = data.get("email");
    password.value = data.get("password");
    hasError.value = false;

    try {
      if (!email.value || !password.value) {
        hasError.value = true;
        throw new Error("missing email or password.");
      }
      const basicAuth = getBasicAuth(email.value, password.value);
      const { token } = await getAuthenticationToken(apiUrl, basicAuth);
      authenticationToken.value = token;
    } catch (e) {
      hasError.value = true;
      console.error("Failed to get authentication options:", e);
    }

    return ctx.render();
  }
};

export default function Login() {
  if (authenticationToken.value) {
    return <div class="container mx-auto w-64">
      <Authentication
        apiUrl={apiUrl}
        token={authenticationToken}
        isAuthenticated={isAuthenticated}
      />
    </div>
  }

  return (
    <div class="container mx-auto w-64">
      <form method="POST">
        <input
          type="email"
          name="email"
          placeholder="e-mail"
          class="w-64 border-b-2 mt-6 mb-2 h-10 p-1"
          value={email.value}
          autocomplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="hasło"
          class="w-64  border-b-2 mb-2 h-10 p-1"
          value={password.value}
          autocomplete="current-password"
        />
        <button
          type="submit"
          class="w-64 bg-slate-200 mt-4 h-10 relative"
        >
          Zaloguj
          {hasError.value && <SvgIcon name="error-shield" position="left" />}
        </button>
      </form>
    </div>
  );
}
