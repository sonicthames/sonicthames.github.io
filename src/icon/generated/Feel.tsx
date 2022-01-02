import * as React from "react";
import { SVGProps } from "react";
export function SvgFeel(props: SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 32 29"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M23.453.969A8.547 8.547 0 0 1 32 9.516c0 7.352-12.283 16.999-15.325 19.275-.4.3-.95.3-1.35-.001C12.287 26.504 0 16.816 0 9.516A8.547 8.547 0 0 1 16 5.33 8.544 8.544 0 0 1 23.453.969Zm-2.982 12.276a3.75 3.75 0 0 0-3.272 1.913l-1.168 2.073-1.168-2.074a3.756 3.756 0 0 0-5.125-1.423 3.747 3.747 0 0 0-1.898 3.258c0 .368.082.785.242 1.238.163.462.41.967.735 1.499.186.305.397.62.633.943a42.118 42.118 0 0 0 1.406 1.46 78.263 78.263 0 0 0 5.147 4.345 76.298 76.298 0 0 0 5.935-5.066l.135-.14c.18-.19.355-.377.525-.563.241-.33.458-.652.647-.964a8.165 8.165 0 0 0 .735-1.503c.16-.456.242-.877.242-1.25 0-2.069-1.68-3.746-3.75-3.746Zm1.296-4.513a4.843 4.843 0 0 0-4.227 2.475l-1.509 2.683-1.509-2.683A4.845 4.845 0 0 0 5.45 13.58c0 .477.105 1.016.312 1.603a9.95 9.95 0 0 0 .741 1.585 5.091 5.091 0 0 1 5.088-4.862 5.09 5.09 0 0 1 4.44 2.595 5.09 5.09 0 0 1 4.44-2.595 5.088 5.088 0 0 1 5.091 5.086l-.002-.207a9.95 9.95 0 0 0 .74-1.588c.207-.59.312-1.134.312-1.617a4.847 4.847 0 0 0-4.845-4.848Zm1.686-5.513a6.294 6.294 0 0 0-5.492 3.214L16 9.918l-1.96-3.485A6.299 6.299 0 0 0 2.25 9.516c0 .619.136 1.319.405 2.08.275.778.69 1.626 1.234 2.52l-.163-.275-.007-.26a6.579 6.579 0 0 1 6.346-6.577l.23-.004a6.574 6.574 0 0 1 5.736 3.358 6.579 6.579 0 0 1 12.31 3.397 13.2 13.2 0 0 0 1.003-2.14c.27-.767.406-1.473.406-2.1a6.297 6.297 0 0 0-6.297-6.296Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
export default SvgFeel;