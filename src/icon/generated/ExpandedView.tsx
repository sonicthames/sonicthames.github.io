import * as React from "react";
import { SVGProps } from "react";
export function SvgExpandedView(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 33 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.045 29.75h7.375c.57 0 1.031.462 1.031 1.031v.188c0 .57-.462 1.031-1.031 1.031H1.795a1 1 0 0 1-1-1v-8.656a1 1 0 0 1 1-1h.25a1 1 0 0 1 1 1v7.406Zm27.5 0v-7.406a1 1 0 0 1 1-1h.25a1 1 0 0 1 1 1V31a1 1 0 0 1-1 1H23.17c-.57 0-1.031-.462-1.031-1.031v-.188c0-.57.461-1.031 1.03-1.031h7.376Zm-28.5-19.094h-.25a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h8.656a1 1 0 0 1 1 1v.25a1 1 0 0 1-1 1H3.045v7.406a1 1 0 0 1-1 1Zm28.5-1V2.25h-7.406a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h8.656a1 1 0 0 1 1 1v8.656a1 1 0 0 1-1 1h-.25a1 1 0 0 1-1-1Z"
        fill="currentColor"
        fillRule="nonzero"
      />
    </svg>
  );
}
export default SvgExpandedView;
