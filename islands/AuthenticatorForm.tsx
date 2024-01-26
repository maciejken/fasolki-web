import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { startAuthentication } from "@simplewebauthn/browser";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import { IconName } from "../components/SvgIcon/types.ts";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { basicAuth, isAuthenticated } from "../utils/auth/state.ts";
import registerAuthenticator from "../utils/auth/registerAuthenticator.ts";

export default function LoginForm() {
  const loading = useSignal(false);
  const hasError = useSignal(false);
  const hasSuccess = useSignal(false);
  const platform = useSignal(true);

  const iconName: IconName | null = getStatusIconName({
    isLoading: loading.value,
    hasError: hasError.value,
    hasSuccess: hasSuccess.value,
  });

  const handleAuthTypeInput = (
    evt: JSX.TargetedEvent<HTMLInputElement, InputEvent>,
  ) => {
    platform.value = evt.currentTarget.checked;

  };

  const handleAuthenticatorRegistration = async (
    evt: JSX.TargetedEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    evt.preventDefault();
    hasError.value = false;
    hasSuccess.value = false;

    try {
      hasSuccess.value = await registerAuthenticator(basicAuth.value, platform.value);
    } catch (e) {
      console.error("error:", e);
      hasError.value = true;
      throw new Error("Failed to register new authenticator.", e);
    } finally {
      loading.value = false;
    }
  };

  if (!isAuthenticated.value) {
    return <div class="mt-8">
      <a href="/login">
        Przejdź do strony logowania
      </a>
    </div>
  }

  return (
    <form onSubmit={handleAuthenticatorRegistration}>
      <label class="px-1">
        <input
          type="checkbox"
          checked={platform.value}
          class="mr-1"
          onChange={handleAuthTypeInput}
        />
        Użyj klucza wbudowanego
      </label>
      <button
        type="submit"
        class="w-64 bg-slate-200 mt-4 h-10 relative"
      >
        Dodaj klucz
        {iconName && <SvgIcon name={iconName} />}
      </button>
    </form>
  );
}
