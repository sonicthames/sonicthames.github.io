import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

interface HProps {
  readonly children: ReactNode;
  readonly id?: string;
  readonly className?: string;
}

export const H1 = ({ children, className, ...props }: HProps): JSX.Element => (
  <h1 className={cn("text-4xl text-primary", className)} {...props}>
    {children}
  </h1>
);

export const H2 = ({ children, className, ...props }: HProps): JSX.Element => (
  <h2 className={cn("text-2xl mb-2 mt-2", className)} {...props}>
    {children}
  </h2>
);

export const H3 = ({ children, className, ...props }: HProps): JSX.Element => (
  <h3 className={cn("text-base text-primary mb-1 mt-1", className)} {...props}>
    {children}
  </h3>
);
