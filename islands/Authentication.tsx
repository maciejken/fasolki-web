import { Signal, useSignal } from "@preact/signals";
import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import { authenticationOptions, isAuthenticated } from "../utils/auth/state.ts";
import { authenticate } from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import getStatusIconName from  "../components/SvgIcon/helpers/getStatusIconName.ts";

interface AuthenticationProps {
  apiUrl: string;
  token: Signal<string>;
  isAuthenticated: Signal<boolean>;
}

export default function Authentication({ apiUrl, token, isAuthenticated }: AuthenticationProps) {
  const hasError = useSignal(false);
  const isLoading = useSignal(false);
  const platform = useSignal(true);

  const iconName = getStatusIconName({
    isLoading: isLoading.value,
    hasError: hasError.value,
    hasSuccess: isAuthenticated.value
  });

  const handleAuthentication = async (evt) => {
    evt.preventDefault();
    const auth = `Bearer ${token.value}`;
    console.log("auth token:", token.value);
    try {
      isLoading.value = true;
      hasError.value = false;
      isAuthenticated.value = await authenticate(apiUrl, token);
    } catch (e) {
      hasError.value = true;
      throw new Error("Failed to authenticate.", e);
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
};
