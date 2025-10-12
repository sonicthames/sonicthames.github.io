import * as React from "react";
import type { SVGProps } from "react";
export function SvgExpandedView(props: SVGProps<SVGSVGElement>): JSX.Element {
  const { "aria-label": ariaLabel = "Expanded View icon", ...restProps } =
    props;
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
        d="M3.045 29.75h7.375c.57 0 1.031.462 1.031 1.031v.188c0 .57-.462 1.031-1.031 1.031H1.795a1 1 0 0 1-1-1v-8.656a1 1 0 0 1 1-1h.25a1 1 0 0 1 1 1zm27.5 0v-7.406a1 1 0 0 1 1-1h.25a1 1 0 0 1 1 1V31a1 1 0 0 1-1 1H23.17c-.57 0-1.031-.462-1.031-1.031v-.188c0-.57.461-1.031 1.03-1.031zm-28.5-19.094h-.25a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h8.656a1 1 0 0 1 1 1v.25a1 1 0 0 1-1 1H3.045v7.406a1 1 0 0 1-1 1m28.5-1V2.25h-7.406a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h8.656a1 1 0 0 1 1 1v8.656a1 1 0 0 1-1 1h-.25a1 1 0 0 1-1-1"
      />
    </svg>
  );
}
export default SvgExpandedView;
