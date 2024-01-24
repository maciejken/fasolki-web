import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { startRegistration } from "npm:@simplewebauthn/browser";

const apiUrl = "https://flat-mouse-55.deno.dev";
// const apiUrl = "http://localhost:4000";

export default function LoginForm() {
  const email = useSignal("");
  const password = useSignal("");

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

    console.log("start registration", email.value, password.value);
    let response: Response;
    let attResp;
    const Authorization = `Basic ${btoa(`${email.value}:${password.value}`)}`;
    try {
      response = await fetch(`${apiUrl}/register/options`, {
        headers: {
          Authorization,
        },
      });
      const registrationOptions = await response.json();
      console.log("registration options:", JSON.stringify(registrationOptions));

      if (registrationOptions) {
        attResp = await startRegistration(registrationOptions);
        console.log("device attestation:", attResp);
      }
    } catch (e) {
      console.error("error:", e);
      throw new Error("Failed to start authenticator registration.", e);
    }

    if (attResp) {
      const verificationResp = await fetch(`${apiUrl}/register/authenticator`, {
        method: "POST",
        headers: {
          Authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attResp),
      });

      const verificationJson = await verificationResp.json();
      console.log("verification json:", verificationJson);
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
        class="w-64 bg-slate-200 mt-4 h-10"
      >
        Zaloguj
      </button>
    </form>
  );
}
