export type IconName = "check" | "clock" | "error-circle" | "error-shield";

export interface StatusOptions {
  isLoading: boolean;
  hasSuccess: boolean;
  hasError: boolean;
}

export interface SvgIconProps {
  name: IconName;
  position?: "left" | "right";
}
