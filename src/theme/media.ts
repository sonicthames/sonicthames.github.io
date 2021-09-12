import { useMediaQuery } from "react-responsive";
import type { DeviceType } from "./device";
import { spacing } from "./spacing";

// REVIEW
export const maxPageWidth = 1200;
export const mobilePageWidth = 768;

export function isUserAgentMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini|Mobile/i.test(
    navigator.userAgent
  );
}

export function useIsUnderPortraitWidth(): boolean {
  return useMediaQuery({
    // TODO calculate
    query: `(max-width: ${maxPageWidth + 2 * spacing.default}px)`,
  });
}

export function useIsUnderMobileWidth(): boolean {
  return useMediaQuery({
    query: `(max-width: ${mobilePageWidth}px)`,
  });
}

// Tentatively
export function useDeviceType(): DeviceType {
  const isUnderPortraitWidth = useIsUnderPortraitWidth();
  const isUnderMobilePageWidth = useIsUnderMobileWidth();
  return isUserAgentMobile()
    ? isUnderMobilePageWidth
      ? "mobile"
      : "portrait"
    : isUnderPortraitWidth
    ? isUnderMobilePageWidth
      ? "mobile"
      : "portrait"
    : "desktop";
}
