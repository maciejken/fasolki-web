import { IconName, StatusOptions } from "../types.ts";

export default function getStatusIconName(
  { hasError, hasSuccess, isLoading }: StatusOptions,
) {
  let iconName: IconName | null = null;

  if (isLoading) {
    iconName = "clock";
  } else if (hasError) {
    iconName = "error-shield";
  } else if (hasSuccess) {
    iconName = "check";
  }

  return iconName;
}
