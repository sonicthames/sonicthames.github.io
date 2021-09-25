import { ReactNode } from "react";
import {
  ExtractRouteParams,
  Route,
  RouteChildrenProps,
  RouteProps,
} from "react-router";
import { RelativePath, RouteSegment } from "../../lib/routing";
import { appRoutes, AppRouteSegment } from "../location";

interface Props<
  B extends string,
  FS extends readonly string[],
  Params extends { [K: string]: string | undefined } = ExtractRouteParams<
    RelativePath<FS>,
    string
  >
> extends Omit<
    RouteProps<RelativePath<FS>, Params>,
    "path" | "children" | "component"
  > {
  segment: AppRouteSegment<B, typeof appRoutes, FS>;
  children:
    | ((
        props: RouteChildrenProps<Params> & {
          segment: RouteSegment<typeof appRoutes, FS>;
        }
      ) => ReactNode)
    | ReactNode
    | undefined;
}

export const AppRoute = <B extends string, FS extends readonly string[]>({
  children,
  ...rest
}: Props<B, FS>) => {
  if (typeof children === "function") {
    return (
      <Route
        children={(props): ReactNode =>
          children({ segment: rest.segment as any, ...props })
        }
        {...rest}
      />
    );
  } else {
    return <Route children={children} {...rest} />;
  }
};
