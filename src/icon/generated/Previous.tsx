import * as React from "react";
import type { SVGProps } from "react";
export function SvgPrevious(props: SVGProps<SVGSVGElement>): JSX.Element {
  const { "aria-label": ariaLabel = "Previous icon", ...restProps } = props;
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
        d="M16.795 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.164-16-16-16m0 2.25c7.594 0 13.75 6.156 13.75 13.75s-6.156 13.75-13.75 13.75S3.045 23.594 3.045 16 9.2 2.25 16.795 2.25m-1.533 6.91L9.14 15.28a1 1 0 0 0 0 1.415l6.12 6.12a1 1 0 0 0 1.415 0l.177-.176a1 1 0 0 0 0-1.414l-5.237-5.237 5.237-5.237a1 1 0 0 0 0-1.415l-.177-.176a1 1 0 0 0-1.414 0m6.364 0-6.121 6.12a1 1 0 0 0 0 1.415l6.12 6.12a1 1 0 0 0 1.415 0l.177-.176a1 1 0 0 0 0-1.414l-5.237-5.237 5.237-5.237a1 1 0 0 0 0-1.415l-.177-.176a1 1 0 0 0-1.414 0"
      />
    </svg>
  );
}
export default SvgPrevious;
