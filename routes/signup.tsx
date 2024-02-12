import { Handlers, PageProps } from "$fresh/server.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import Registration from "../islands/Registration.tsx";
import {
  getBasicAuth,
  getRegistrationToken,
} from "../utils/auth/authService.ts";
import { apiUrl, appUrl } from "../config.ts";
import { email, password, registrationToken } from "../utils/auth/state.ts";
import { firstName, hasError, lastName, phone } from "../utils/user/state.ts";
import createUser from "../utils/user/createUser.ts";

interface Data {
  mobile: string | undefined;
}

export const handler: Handlers = {
  async POST(req, ctx): Promise<Response> {
    const data = new URLSearchParams(await req.text());
    const mobile: string = new URL(req.url).searchParams.get("mobile") || "";
    firstName.value = data.get("firstname") || "";
    lastName.value = data.get("lastname") || "";
    email.value = data.get("email") || "";
    password.value = data.get("password") || "";
    phone.value = data.get("phone") || "";
    hasError.value = false;

    try {
      if (!email.value || !password.value || !firstName || !lastName) {
        hasError.value = true;
        throw new Error("some data is missing.");
      }

      await createUser({
        email: email.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        phone: phone.value,
      });

      const basicAuth = getBasicAuth(email.value, password.value);
      const { token } = await getRegistrationToken(apiUrl!, basicAuth);
      registrationToken.value = token;
    } catch (e) {
      hasError.value = true;
      registrationToken.value = "";
      console.error("Failed to register authenticator:", e);
    }

    return ctx.render({ mobile });
  },
};

export default function Signup({ data }: PageProps<Data>) {
  const { mobile } = data;

  if (registrationToken.value) {
    return (
      <div class="container mx-auto w-64">
        <Registration
          apiUrl={apiUrl!}
          appUrl={appUrl!}
          token={registrationToken}
          mobile={mobile}
        />
      </div>
    );
  }
  return (
    <div class="container mx-auto w-64">
      <form method="POST">
        <input
          type="text"
          name="firstname"
          placeholder="imię"
          class="w-64 border-b-2 mt-6 mb-2 h-10 p-1"
          value={firstName.value}
        />
        <input
          type="text"
          name="lastname"
          placeholder="nazwisko"
          class="w-64 border-b-2 mb-2 h-10 p-1"
          value={lastName.value}
        />
        <input
          type="email"
          name="email"
          placeholder="e-mail"
          class="w-64 border-b-2 mb-2 h-10 p-1"
          value={email.value}
          autocomplete="username"
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
          type="text"
          name="phone"
          placeholder="telefon"
          class="w-64 border-b-2 mb-3 h-10 p-1"
          value={phone.value}
          autocomplete="phone"
        />
        <button
          type="submit"
          class="w-64 bg-slate-200 mt-4 h-10 relative"
        >
          Wyślij
          {hasError.value && <SvgIcon name="error-shield" position="left" />}
        </button>
      </form>
    </div>
  );
}
