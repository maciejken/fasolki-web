import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { startAuthentication } from "@simplewebauthn/browser";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import { IconName } from "../components/SvgIcon/types.ts";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { basicAuth, isAuthenticated } from "../utils/auth/state.ts";
import AuthenticatorForm from "./AuthenticatorForm.tsx";

const apiUrl = "https://flat-mouse-55.deno.dev";
// const apiUrl = "http://localhost:4000";

export default function LoginForm() {
  const email = useSignal("");
  const password = useSignal("");
  const loading = useSignal(false);
  const hasError = useSignal(false);
  const hasSuccess = useSignal(false);

  const iconName: IconName | null = getStatusIconName({
    isLoading: loading.value,
    hasError: hasError.value,
  });

  const handleEmailInput = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    email.value = evt.currentTarget.value;
  };

  const handlePasswordInput = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    password.value = evt.currentTarget.value;
  };

  const handleLogin = async (
    evt: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    evt.preventDefault();
    hasError.value = false;
    const hasMissingData = !basicAuth.value && !(email.value && password.value);

    if (hasMissingData) {
      hasError.value = true;
      throw new Error("Some data is missing.");
    }

    if (!basicAuth.value) {
      basicAuth.value = `Basic ${btoa(`${email.value}:${password.value}`)}`;
    }

    console.log("start authentication", email.value, password.value);
    let response: Response;
    let attResp;
    try {
      loading.value = true;
      response = await fetch(`${apiUrl}/authentication/options`, {
        headers: {
          Authorization: basicAuth.value,
        },
      });
      const authOptions = await response.json();
      console.log("authentication options:", JSON.stringify(authOptions));

      if (authOptions) {
        attResp = await startAuthentication(authOptions);
        console.log("device attestation:", attResp);
      }

      if (attResp) {
        hasSuccess.value = true;
        const verificationResp = await fetch(
          `${apiUrl}/authentication/info`,
          {
            method: "POST",
            headers: {
              Authorization: basicAuth.value,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attResp),
          },
        );

        const verificationJson = await verificationResp.json();
        console.log("verification json:", verificationJson);
        isAuthenticated.value = verificationJson.userVerified;
      }
    } catch (e) {
      console.error("error:", e);
      hasError.value = true;
      throw new Error("Failed to authenticate.", e);
    } finally {
      loading.value = false;
      console.log("auth state:", isAuthenticated.value);
    }
  };

  if (isAuthenticated.value) {
    return <div class="mt-8">
      <AuthenticatorForm />
    </div>
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        name="email"
        placeholder="e-mail"
        class="w-64 border-b-2 mt-6 mb-2 h-10 p-1"
        onInput={handleEmailInput}
      />
      <input
        type="password"
        name="password"
        placeholder="hasło"
        class="w-64  border-b-2 mb-2 h-10 p-1"
        onInput={handlePasswordInput}
      />
      <button
        type="submit"
        class="w-64 bg-slate-200 mt-4 h-10 relative"
      >
        Zaloguj
        {iconName && <SvgIcon name={iconName} position="left" />}
      </button>
    </form>
  );
}
