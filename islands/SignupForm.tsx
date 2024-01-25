import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { startRegistration } from "npm:@simplewebauthn/browser";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import { IconName } from "../components/SvgIcon/types.ts";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";

const apiUrl = "https://flat-mouse-55.deno.dev";
// const apiUrl = "http://localhost:4000";

export default function SignupForm() {
  const firstname = useSignal("");
  const lastname = useSignal("");
  const email = useSignal("");
  const password = useSignal("");
  const phone = useSignal("");
  const loading = useSignal(false);
  const hasError = useSignal(false);
  const hasSuccess = useSignal(false);

  const iconName: IconName | null = getStatusIconName({
    isLoading: loading.value,
    hasError: hasError.value,
    hasSuccess: hasSuccess.value,
  });

  const handleFirstnameInput = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    firstname.value = evt.currentTarget.value;
  };

  const handleLastnameInput = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    lastname.value = evt.currentTarget.value;
  };

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

  const handlePhoneInput = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    phone.value = evt.currentTarget.value;
  };

  const handleSignup = async (
    evt: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    evt.preventDefault();
    hasError.value = false;

    if (
      !firstname.value || !lastname.value || !email.value || !password.value
    ) {
      hasError.value = true;
      throw new Error("Some data is missing.");
    }

    console.log("start registration", email.value, password.value);
    let attResp;
    let Authorization;

    try {
      loading.value = true;
      const newUserResponse = await fetch(`${apiUrl}/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstname.value,
          lastName: lastname.value,
          email: email.value,
          password: password.value,
          phone: phone.value,
        }),
      });
      const newUser = await newUserResponse.json();

      console.log(newUser);

      Authorization = `Basic ${btoa(`${email.value}:${password.value}`)}`;
      const response = await fetch(`${apiUrl}/registration/options`, {
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
      hasError.value = true;
      throw new Error("Failed to start authenticator registration.", e);
    } finally {
      loading.value = false;
    }

    if (attResp) {
      const verificationResp = await fetch(
        `${apiUrl}/registration/authenticator`,
        {
          method: "POST",
          headers: {
            Authorization,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attResp),
        },
      );

      const verificationJson = await verificationResp.json();
      console.log("verification json:", verificationJson);
      hasSuccess.value = true;
    }
  };

  if (hasSuccess.value) {
    return (
      <div class="w-64 mt-4">
        <a href="/login">
          Przejdź do strony logowania
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup}>
      <input
        type="text"
        name="firstname"
        placeholder="imię"
        class="w-64 border-b-2 mt-6 mb-2 h-10 p-1"
        onInput={handleFirstnameInput}
      />
      <input
        type="text"
        name="lastname"
        placeholder="nazwisko"
        class="w-64 border-b-2 mb-2 h-10 p-1"
        onInput={handleLastnameInput}
      />
      <input
        type="email"
        name="email"
        placeholder="e-mail"
        class="w-64 border-b-2 mb-2 h-10 p-1"
        onInput={handleEmailInput}
      />
      <input
        type="password"
        name="password"
        placeholder="hasło"
        class="w-64  border-b-2 mb-2 h-10 p-1"
        onInput={handlePasswordInput}
      />
      <input
        type="text"
        name="phone"
        placeholder="telefon"
        class="w-64 border-b-2 mb-2 h-10 p-1"
        onInput={handlePhoneInput}
      />
      <button
        type="submit"
        class="w-64 bg-slate-200 mt-4 h-10 relative"
      >
        Wyślij
        {iconName && <SvgIcon name={iconName} />}
      </button>
    </form>
  );
}
