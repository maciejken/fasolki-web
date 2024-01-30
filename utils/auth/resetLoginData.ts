import { email, password, basicAuth, hasError, authenticationOptions } from "./state.ts";

export default function resetLoginData() {
  email.value = "";
  password.value = "";
  basicAuth.value = "";
  hasError.value = false;
  authenticationOptions.value = null;
}