import { email, hasError, password } from "./state.ts";

export default function resetLoginData() {
  email.value = "";
  password.value = "";
  hasError.value = false;
}
