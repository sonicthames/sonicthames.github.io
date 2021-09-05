import { css, cx } from "@emotion/css";
import React from "react";
import Headphones from "./generated/Headphones";

export const icons = {
  Headphones,
} as const;

export type KnownIcons = keyof typeof icons;
export type KnownIcon = KnownIcons;

export interface IconProps {
  name: KnownIcons;
  className?: string;
  height?: number | string;
  width?: number | string;
  color?: string;
}

export const Icon = ({ name, className, ...props }: IconProps): JSX.Element => {
  const C = icons[name];
  return (
    <C className={cx([css({ overflow: "visible" }), className])} {...props} />
  );
};
