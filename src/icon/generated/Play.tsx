import type { SVGProps } from "react"
export function SvgPlay(props: SVGProps<SVGSVGElement>) {
  const { "aria-label": ariaLabel = "Play icon", ...restProps } = props
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
        d="M16.795 0c8.836 0 16 7.163 16 16s-7.164 16-16 16-16-7.163-16-16 7.163-16 16-16m0 2.25C9.2 2.25 3.045 8.406 3.045 16S9.2 29.75 16.795 29.75s13.75-6.156 13.75-13.75-6.156-13.75-13.75-13.75M11.91 10c.173 0 .343.04.498.118l9.77 4.885a1.115 1.115 0 0 1 0 1.994l-9.77 4.885a1.115 1.115 0 0 1-1.613-.997v-9.77c0-.616.499-1.115 1.115-1.115"
      />
    </svg>
  )
}
export default SvgPlay
