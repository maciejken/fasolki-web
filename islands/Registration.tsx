import { Signal, useSignal } from "@preact/signals";
import { registerAuthenticator } from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { JSX } from "preact/jsx-runtime";

interface RegistrationProps {
  apiUrl: string;
  token: Signal<string>;
  isRegistered: Signal<boolean>;
}

export default function Registration(
  { apiUrl, token, isRegistered }: RegistrationProps,
) {
  const hasError = useSignal(false);
  const isLoading = useSignal(false);
  const platform = useSignal(true);

  const iconName = getStatusIconName({
    isLoading: isLoading.value,
    hasError: hasError.value,
    hasSuccess: isRegistered.value,
  });

  const handlePlatformChange = (evt: JSX.TargetedEvent<HTMLInputElement>) => {
    platform.value = evt.currentTarget.checked;
  };

  const handleRegistration = async (
    evt: JSX.TargetedEvent<HTMLFormElement>,
  ) => {
    evt.preventDefault();
    try {
      hasError.value = false;
      isLoading.value = true;
      isRegistered.value = await registerAuthenticator({
        apiUrl,
        token: token.value,
        platform: platform.value,
      });
    } catch (e) {
      isRegistered.value = false;
      hasError.value = true;
      console.error("Registration failed:", e);
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <form onSubmit={handleRegistration} class="mt-8">
      <label class="px-1">
        <input
          type="checkbox"
          checked={platform.value}
          class="mr-1"
          onChange={handlePlatformChange}
        />
        Użyj klucza wbudowanego
      </label>
      <button
        type="submit"
        class="w-64 bg-slate-200 mt-4 h-10 relative"
      >
        Dodaj klucz
        {iconName && <SvgIcon name={iconName} position="left" />}
      </button>
    </form>
  );
}
