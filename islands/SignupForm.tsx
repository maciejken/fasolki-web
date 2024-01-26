import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import { IconName } from "../components/SvgIcon/types.ts";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { basicAuth, isAuthenticated } from "../utils/auth/state.ts";
import registerAuthenticator from "../utils/auth/registerAuthenticator.ts";
import AuthenticatorForm from "./AuthenticatorForm.tsx";

const apiUrl = "https://flat-mouse-55.deno.dev";
// const apiUrl = "http://localhost:4000";

export default function SignupForm() {
  const firstname = useSignal("");
  const lastname = useSignal("");
  const email = useSignal("");
  const password = useSignal("");
  const phone = useSignal("");
  const platform = useSignal(true);
  const loading = useSignal(false);
  const hasError = useSignal(false);

  const iconName: IconName | null = getStatusIconName({
    isLoading: loading.value,
    hasError: hasError.value,
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

  const handleAuthTypeChange = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    platform.value = evt.currentTarget.checked;
  };

  const handleSignup = async (
    evt: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    evt.preventDefault();
    hasError.value = false;
    isAuthenticated.value = false;
    const hasMissingData = !basicAuth.value && !(firstname.value && lastname.value && email.value && password.value);

    if (hasMissingData) {
      hasError.value = true;
      throw new Error("Some data is missing.");
    }

    if (!basicAuth.value) {
      basicAuth.value = `Basic ${btoa(`${email.value}:${password.value}`)}`;
    }

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

      isAuthenticated.value = await registerAuthenticator(basicAuth.value, platform.value);
    } catch (e) {
      console.error("error:", e);
      hasError.value = true;
      throw new Error("Registration failed.", e);
    } finally {
      loading.value = false;
    }
  };

  if (isAuthenticated.value) {
    return (
      <div class="mt-8">

        <p class="mb-8">
          <a href="/login">
            Przejdź do strony logowania
          </a>
        </p>

        <p class="my-1">
          <AuthenticatorForm />
        </p>

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
        class="w-64 border-b-2 mb-3 h-10 p-1"
        onInput={handlePhoneInput}
      />
      <label class="px-1">
        <input
          type="checkbox"
          checked={platform.value}
          class="mr-1"
          onChange={handleAuthTypeChange}
        />
        Użyj klucza wbudowanego
      </label>
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
