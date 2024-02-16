import { Signal, useSignal } from "@preact/signals";
import { authenticate } from "../utils/auth/authService.ts";
import SvgIcon from "../components/SvgIcon/SvgIcon.tsx";
import getStatusIconName from "../components/SvgIcon/helpers/getStatusIconName.ts";
import { JSX } from "preact/jsx-runtime";

interface AuthenticationProps {
  apiUrl: string;
  appUrl: string;
  token: Signal<string>;
  mobile: boolean;
}

export default function Authentication(
  { apiUrl, appUrl, token, mobile }: AuthenticationProps,
) {
  const hasError = useSignal(false);
  const isLoading = useSignal(false);
  const authToken = useSignal("");

  const iconName = getStatusIconName({
    isLoading: isLoading.value,
    hasError: hasError.value,
    hasSuccess: !!authToken.value,
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

      if (genericToken) {
        authToken.value = genericToken;
        console.debug(genericToken);
      }
    } catch (e) {
      hasError.value = true;
      throw new Error(`Failed to authenticate: ${e}`);
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <form onSubmit={handleAuthentication} class="flex gap-8 py-6">
      <div class="flex-col">
        <button
          type="submit"
          class="w-64 bg-slate-200 mt-4 h-10 relative"
        >
          Użyj klucza
          {iconName && <SvgIcon name={iconName} position="left" />}
        </button>
        {mobile && authToken.value && (
          <a
            href={`${appUrl}?${new URLSearchParams({
              mobile: mobile ? "true" : "false",
              token: authToken.value,
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
