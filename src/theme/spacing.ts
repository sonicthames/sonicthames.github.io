import { flow, pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";

export const raw_spacing = {
  xxxs: 0.2,
  xxs: 0.4,
  xs: 0.6,
  s: 0.8,
  default: 1,
  l: 1.2,
  xl: 1.4,
  xxl: 1.6,
  xxxl: 1.8,
};
type Spacing = keyof typeof raw_spacing;

export const spacing = (
  first: Spacing = "default",
  ...args: ReadonlyArray<Spacing>
) =>
  pipe(
    args,
    RA.reduce(raw_spacing[first], (acc, x) => acc + raw_spacing[x])
  );

export const spacingRem = flow(spacing, (x) => `${x}rem`);

export const spacingEm = flow(spacing, (x) => `${x}em`);

export const controlIconSize = "1.25rem";
