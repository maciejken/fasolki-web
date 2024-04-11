import { apiUrl, appUrl } from "../config.ts";
import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import {
  getAuthenticationToken,
  getBasicAuth,
} from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import Authentication from "../islands/Authentication.tsx";
import {
  authenticationToken,
  email,
  hasError,
  password,
} from "../utils/auth/state.ts";

interface Data {
  mobile: boolean;
  publicKey?: string;
}

async function renderLogin(
  ctx: FreshContext,
  data: URLSearchParams,
): Promise<Response> {
  hasError.value = false;

  email.value = data.get("email") || "";
  password.value = data.get("password") || "";
  authenticationToken.value = data.get("auth_token") || "";
  const mobile: string = data.get("mobile") || "";
  const publicKey: string = data.get("publicKey") || "";

  const hasAuthData = !!(email.value && password.value) ||
    !!authenticationToken.value;

  try {
    if (!hasAuthData) {
      hasError.value = true;
      throw new Error("missing authentication data.");
    }
    if (!authenticationToken.value) {
      const basicAuth = getBasicAuth(email.value, password.value);
      const { token } = await getAuthenticationToken(apiUrl!, basicAuth);
      authenticationToken.value = token;
    }
  } catch (e) {
    hasError.value = true;
    console.error("Failed to get authentication options:", e);
  }

  return ctx.render({ mobile: mobile === "true", publicKey });
}

export const handler: Handlers<Data> = {
  GET(req: Request, ctx: FreshContext) {
    const searchParams = new URL(req.url).searchParams;
    const mobile = searchParams.get("mobile");
    const publicKey = searchParams.get("publicKey");

    return ctx.render({ mobile: mobile === "true", publicKey });
  },
  async POST(req: Request, ctx: FreshContext): Promise<Response> {
    const formData = new URLSearchParams(await req.text());
    const searchParams = new URL(req.url).searchParams;
    const mobile = searchParams.get("mobile") || "";
    const publicKey = searchParams.get("publicKey") || "";
    formData.set("mobile", mobile);
    formData.set("publicKey", publicKey);

    return renderLogin(ctx, formData);
  },
};

export default function Login({ data }: PageProps<Data>) {
  const { mobile, publicKey } = data;
  if (authenticationToken.value) {
    return (
      <div class="container mx-auto w-64">
        <Authentication
          apiUrl={apiUrl!}
          appUrl={appUrl!}
          token={authenticationToken}
          mobile={mobile}
          publicKey={publicKey}
        />
      </div>
    );
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
        <input
          type="hidden"
          name="auth_token"
          value={authenticationToken.value}
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
