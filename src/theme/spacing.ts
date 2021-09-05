import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";

export const fontSizes = {
  xxs: 0.4,
  xs: 0.6,
  s: 0.8,
  default: 1,
  l: 1.2,
  xl: 1.4,
  xxl: 1.6,
  xxxl: 1.8,
};
type FontSize = keyof typeof fontSizes;

const space = (first: FontSize = "default", ...args: ReadonlyArray<FontSize>) =>
  pipe(
    args,
    RA.reduce(fontSizes[first], (acc, x) => acc + fontSizes[x])
  );

export const spaceRem = flow(space, (x) => `${x}rem`);

export const spaceEm = flow(space, (x) => `${x}em`);

export const maxPageSize = "1200px";
