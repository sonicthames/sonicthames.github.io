import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";

export const spacing = {
  none: 0,
  xxs: 0.4,
  xs: 0.6,
  s: 0.8,
  default: 1,
  l: 1.2,
  xl: 1.4,
  xxl: 1.6,
  xxxl: 1.8,
};
type Spacing = keyof typeof spacing;

const size = (first: Spacing = "default", ...args: ReadonlyArray<Spacing>) =>
  pipe(
    args,
    RA.reduce(spacing[first], (acc, x) => acc + spacing[x])
  );

export const fontSize = flow(size, (x) => `${x}rem`);
