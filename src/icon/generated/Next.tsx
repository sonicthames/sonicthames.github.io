import * as React from "react";
import { SVGProps } from "react";
export function SvgNext(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 33 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.795 0c8.836 0 16 7.163 16 16s-7.164 16-16 16c-8.837 0-16-7.163-16-16s7.163-16 16-16Zm0 2.25C9.2 2.25 3.045 8.406 3.045 16S9.2 29.75 16.795 29.75s13.75-6.156 13.75-13.75-6.156-13.75-13.75-13.75Zm1.533 6.91 6.12 6.12a1 1 0 0 1 0 1.415l-6.12 6.12a1 1 0 0 1-1.414 0l-.177-.176a1 1 0 0 1 0-1.414l5.237-5.237-5.237-5.237a1 1 0 0 1 0-1.415l.177-.176a1 1 0 0 1 1.414 0Zm-6.364 0 6.12 6.12a1 1 0 0 1 0 1.415l-6.12 6.12a1 1 0 0 1-1.414 0l-.177-.176a1 1 0 0 1 0-1.414l5.237-5.237-5.237-5.237a1 1 0 0 1 0-1.415l.177-.176a1 1 0 0 1 1.414 0Z"
        fill="currentColor"
        fillRule="nonzero"
      />
    </svg>
  );
}
export default SvgNext;
