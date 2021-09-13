export type RGBColor = readonly [number, number, number];
export type RGBAColor = readonly [...RGBColor, number?];

export const brandColors = {
  main: {
    main: "#607d8b",
    light: "#cfd8dc",
    dark: "#263238",
    contrastText: "#fff",
  },
  action: {
    main: "#2196f3",
    light: "#90caf9",
    dark: "#0d47a1",
    contrastText: "#fff",
  },
  neve: {
    primary: [236, 235, 231],
  },
  neutral: {
    main: "#21283B",
    s25: "#595D6A",
    s75: "#C7C9CD",
    s95: "#F3F4F4",
  },
  map: {
    water: [124, 187, 192],
    land: [72, 60, 51],
  },
} as const;

export const colorToCssRGB = ([r, g, b]: RGBColor): string =>
  `rgb(${r},${g},${b})`;

// Safari transparency issue: https://stackoverflow.com/a/30674347/836839
export const colorToCssRGBA = ([r, g, b, a = 1]: RGBAColor): string =>
  `rgba(${r},${g},${b},${a})`;

export const colorToCssHex = ([r, g, b]: RGBColor): string =>
  `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
