export type RGBColor = readonly [number, number, number]
export type RGBAColor = readonly [...RGBColor, number?]

export const brandColors = {
  main: {
    main: [0x38, 0x2e, 0x32],
    light: [0xfa, 0xf2, 0xf4],
    dark: [0x28, 0x12, 0x20],
    contrastText: [0xff, 0xff, 0xff],
  },
  action: {
    main: [0x21, 0x96, 0xf3],
    light: [0x90, 0xca, 0xf9],
    dark: [0x0d, 0x47, 0xa1],
    contrastText: [0xff, 0xff, 0xff],
  },
  neve: {
    primary: [236, 235, 231],
  },
  neutral: {
    white: "#FFF",
    black: "#000",
    main: "#21283B",
    s25: "#595D6A",
    s75: "#C7C9CD",
    s95: "#F3F4F4",
  },
  icons: {
    listen: "#7BE495", // Pastel vibrant green
    see: "#67C3F3", // Pastel vibrant blue
    feel: "#FF6B9D", // Pastel vibrant pink
  },
  map: {
    water: [124, 187, 192],
    land: [72, 60, 51],
  },
} as const

export const colorToCssRGB = ([r, g, b]: RGBColor): string =>
  `rgb(${r},${g},${b})`

// Safari transparency issue: https://stackoverflow.com/a/30674347/836839
export const colorToCssRGBA = ([r, g, b, a = 1]: RGBAColor): string =>
  `rgba(${r},${g},${b},${a})`

export const colorToCssHex = ([r, g, b]: RGBColor): string =>
  `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
