import * as React from "react";
export function SvgClose(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M16.95 8.464L13.414 12l3.536 3.536-1.414 1.414L12 13.414 8.464 16.95 7.05 15.536 10.586 12 7.05 8.464 8.464 7.05 12 10.586l3.536-3.536 1.414 1.414z"
          fill="currentColor"
        />
        <rect
          stroke="currentColor"
          x={0.5}
          y={0.5}
          width={23}
          height={23}
          rx={11.5}
        />
      </g>
    </svg>
  );
}
export default SvgClose;
