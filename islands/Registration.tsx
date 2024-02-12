import { Signal, useSignal } from "@preact/signals";
import { registerAuthenticator } from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { JSX } from "preact/jsx-runtime";

interface RegistrationProps {
  apiUrl: string;
  appUrl: string;
  token: Signal<string>;
  mobile?: string;
}

export default function Registration(
  { apiUrl, appUrl, token, mobile }: RegistrationProps,
) {
  const hasError = useSignal(false);
  const hasSuccess = useSignal(false);
  const isLoading = useSignal(false);
  const platform = useSignal(true);

  const iconName = getStatusIconName({
    isLoading: isLoading.value,
    hasError: hasError.value,
    hasSuccess: hasSuccess.value,
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
      hasSuccess.value = await registerAuthenticator({
        apiUrl,
        token: token.value,
        platform: platform.value,
      });
    } catch (e) {
      hasSuccess.value = false;
      hasError.value = true;
      console.error("Registration failed:", e);
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <form onSubmit={handleRegistration} class="mt-8">
      <div class="flex-col">
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
        {mobile && (
          <a
            href={`${appUrl}?${new URLSearchParams({
              mobile,
            })}`}
            class="w-64 mt-4 h-10 py-2 flex justify-center bg-slate-50"
          >
            Fasolki
          </a>
        )}
      </div>
    </form>
  );
}
