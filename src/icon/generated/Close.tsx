import * as React from "react";
import type { SVGProps } from "react";
export function SvgClose({
  "aria-label": ariaLabel = "Close icon",
  ...props
}: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width="1em"
      height="1em"
      viewBox="0 0 33 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{ariaLabel}</title>
      <path
        d="M18.517 16 32.404 2.113A1.218 1.218 0 0 0 30.682.39L16.795 14.278 2.908.39a1.218 1.218 0 0 0-1.723 1.723L15.073 16 1.185 29.887a1.218 1.218 0 1 0 1.723 1.723l13.887-13.888L30.682 31.61a1.218 1.218 0 1 0 1.722-1.723L18.517 16Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
export default SvgClose;
