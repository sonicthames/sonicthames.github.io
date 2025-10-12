import * as React from "react";
import type { SVGProps } from "react";
export function SvgFeelV0(props: SVGProps<SVGSVGElement>): JSX.Element {
  const { "aria-label": ariaLabel = "Feel V0 icon", ...restProps } = props;
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 26 32"
      {...restProps}
    >
      <title>{ariaLabel}</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12.764 24.563a3.719 3.719 0 1 1 0 7.437 3.719 3.719 0 0 1 0-7.437M18.66 0a6.725 6.725 0 0 1 6.728 6.723c0 5.784-9.668 13.372-12.063 15.163a.885.885 0 0 1-1.062-.001C9.871 20.087.201 12.465.201 6.723A6.725 6.725 0 0 1 6.928 0a6.73 6.73 0 0 1 5.867 3.43A6.73 6.73 0 0 1 18.66 0"
      />
    </svg>
  );
}
export default SvgFeelV0;
