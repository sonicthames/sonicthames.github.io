/**
 * Converts space-separated RGB string to rgba
 * @example rgba("250 242 244", 0.98) → "rgba(250, 242, 244, 0.98)"
 */
export const rgba = (rgb: string, alpha = 1): string =>
  `rgba(${rgb.replace(/\s+/g, ", ")}, ${alpha})`

/**
 * Converts space-separated RGB string to rgb
 * @example rgb("250 242 244") → "rgb(250, 242, 244)"
 */
export const rgb = (rgbString: string): string =>
  `rgb(${rgbString.replace(/\s+/g, ", ")})`
