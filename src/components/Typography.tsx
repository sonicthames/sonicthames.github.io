import { css } from "@emotion/css";
import React, { type ReactNode } from "react";
import { brandColors, colorToCssHex } from "../theme/colors";
import { fontSize } from "../theme/fontSize";
import { spacingRem } from "../theme/spacing";

interface HProps {
  readonly children: ReactNode;
  readonly id?: string;
}

export const H1 = ({ children, ...props }: HProps): JSX.Element => (
  <h1
    className={css({
      fontSize: fontSize("xxl"),
      color: colorToCssHex(brandColors.main.main),
    })}
    {...props}
  >
    {children}
  </h1>
);

export const H2 = ({ children, ...props }: HProps): JSX.Element => (
  <h2
    className={css({
      fontSize: fontSize("l"),
      marginBottom: spacingRem("s"),
      marginTop: spacingRem("s"),
    })}
    {...props}
  >
    {children}
  </h2>
);

export const H3 = ({ children, ...props }: HProps): JSX.Element => (
  <h3
    className={css({
      fontSize: fontSize("default"),
      color: colorToCssHex(brandColors.main.main),
      marginBottom: spacingRem("xs"),
      marginTop: spacingRem("xs"),
    })}
    {...props}
  >
    {children}
  </h3>
);
