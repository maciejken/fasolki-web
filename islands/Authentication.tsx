import { Signal, useSignal } from "@preact/signals";
import { authenticate } from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { JSX } from "preact/jsx-runtime";

interface AuthenticationProps {
  apiUrl: string;
  targetOrigin: string;
  token: Signal<string>;
  isAuthenticated: Signal<boolean>;
}

export default function Authentication(
  { apiUrl, targetOrigin, token, isAuthenticated }: AuthenticationProps,
) {
  const hasError = useSignal(false);
  const isLoading = useSignal(false);

  const iconName = getStatusIconName({
    isLoading: isLoading.value,
    hasError: hasError.value,
    hasSuccess: isAuthenticated.value,
  });

  const handleAuthentication = async (evt: JSX.TargetedEvent) => {
    evt.preventDefault();

    try {
      isLoading.value = true;
      hasError.value = false;
      const genericToken: string | undefined = await authenticate(
        apiUrl,
        token.value,
      );
      isAuthenticated.value = !!genericToken;

      const message = {
        type: token ? "AUTH_SUCCESS" : "AUTH_ERROR",
        data: genericToken,
      };

      window.postMessage(message, targetOrigin);
    } catch (e) {
      hasError.value = true;
      throw new Error(`Failed to authenticate: ${e}`);
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <form onSubmit={handleAuthentication} class="flex gap-8 py-6">
      <button
        type="submit"
        class="w-64 bg-slate-200 mt-4 h-10 relative"
      >
        Użyj klucza
        {iconName && <SvgIcon name={iconName} position="left" />}
      </button>
    </form>
  );
}
