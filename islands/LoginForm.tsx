import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { startAuthentication } from "npm:@simplewebauthn/browser@9.0.0";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import { IconName } from "../components/SvgIcon/types.ts";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";

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
    hasSuccess: hasSuccess.value,
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

    if (
      !email.value || !password.value
    ) {
      hasError.value = true;
      throw new Error("Some data is missing.");
    }

    console.log("start authentication", email.value, password.value);
    let response: Response;
    let attResp;
    const Authorization = `Basic ${btoa(`${email.value}:${password.value}`)}`;
    try {
      loading.value = true;
      response = await fetch(`${apiUrl}/authentication/options`, {
        headers: {
          Authorization,
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
        // const verificationResp = await fetch(
        //   `${apiUrl}/register/authenticator`,
        //   {
        //     method: "POST",
        //     headers: {
        //       Authorization,
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(attResp),
        //   },
        // );

        //   const verificationJson = await verificationResp.json();
        //   console.log("verification json:", verificationJson);
      }
    } catch (e) {
      console.error("error:", e);
      hasError.value = true;
      throw new Error("Failed to start authenticator registration.", e);
    } finally {
      loading.value = false;
    }
  };

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
