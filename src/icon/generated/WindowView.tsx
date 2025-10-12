import * as React from "react";
import type { SVGProps } from "react";
export function SvgWindowView(props: SVGProps<SVGSVGElement>): JSX.Element {
  const { "aria-label": ariaLabel = "Window View icon", ...restProps } = props;
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 33 32"
      {...restProps}
    >
      <title>{ariaLabel}</title>
      <path
        fill="currentColor"
        fillRule="nonzero"
        d="M2.045 21.344a1 1 0 0 1 1 1v7.406h7.375c.57 0 1.031.462 1.031 1.031v.188c0 .57-.462 1.031-1.031 1.031H1.795a1 1 0 0 1-1-1v-8.656a1 1 0 0 1 1-1zM31.782 16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V17a1 1 0 0 1 1-1zM10.451 0a1 1 0 0 1 1 1v.25a1 1 0 0 1-1 1H3.045v7.406a1 1 0 0 1-1 1h-.25a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zm21.344 0a1 1 0 0 1 1 1v8.656a1 1 0 0 1-1 1h-.25a1 1 0 0 1-1-1V2.25h-7.406a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"
      />
    </svg>
  );
}
export default SvgWindowView;
