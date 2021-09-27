import { ReactNode } from "react";
import {
  ExtractRouteParams,
  RouteComponentProps,
  RouteProps,
} from "react-router";
import { Route } from "react-router-dom";
import { RelativePath, RouteSegment, ToRouteSegment } from "../../lib/routing";
import { appRoutes } from "../location";

interface Props<
  // B extends string,
  FS extends readonly string[],
  Params extends { [K: string]: string | undefined } = ExtractRouteParams<
    RelativePath<FS>,
    string
  >
> extends Omit<
    RouteProps<RelativePath<FS>, Params>,
    "path" | "children" | "component" | "render"
  > {
  segment: ToRouteSegment<typeof appRoutes, FS>;
  children:
    | ((
        props: RouteComponentProps<Params> & {
          segment: RouteSegment<typeof appRoutes, FS>;
        }
      ) => ReactNode)
    | ReactNode
    | undefined;
}

export const AppRoute = <FS extends readonly string[]>({
  children,
  ...rest
}: Props<FS>): JSX.Element => {
  return typeof children === "function" ? (
    <Route
      path={rest.segment.path}
      render={(props): ReactNode =>
        // @ts-ignore
        children({ segment: rest.segment, ...props })
      }
      {...rest}
    />
  ) : (
    <Route path={rest.segment.path} children={children} {...rest} />
  );
};
