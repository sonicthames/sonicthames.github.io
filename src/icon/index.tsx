import { css, cx } from "@emotion/css";
import React from "react";
import * as icons from "./generated";

export type KnownIcons = keyof typeof icons;
export type KnownIcon = KnownIcons;

export interface IconProps {
  readonly name: KnownIcons;
  readonly className?: string;
  readonly height?: number | string;
  readonly width?: number | string;
  readonly color?: string;
}

export const Icon = ({ name, className, ...props }: IconProps): JSX.Element => {
  const C = icons[name];
  return (
    <C className={cx([css({ overflow: "visible" }), className])} {...props} />
  );
};
