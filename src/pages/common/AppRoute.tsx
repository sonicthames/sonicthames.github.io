import { ReactNode } from "react";
import type { ExtractRouteParams, RouteProps } from "react-router";
import type { RouteComponentProps } from "react-router-dom";
import { Route } from "react-router-dom";
import { RelativePath, RouteSegment, ToRouteSegment } from "../../lib/routing";
import { appRoutes } from "../location";

interface Props<
  // B extends string,
  FS extends readonly string[],
  Params extends {
    readonly [K: string]: string | undefined;
  } = ExtractRouteParams<RelativePath<FS>, string>
> extends Omit<
    RouteProps<RelativePath<FS>, Params>,
    "path" | "children" | "component" | "render"
  > {
  readonly segment: ToRouteSegment<typeof appRoutes, FS>;
  readonly children:
    | ((
        props: RouteComponentProps<Params> & {
          readonly segment: RouteSegment<typeof appRoutes, FS>;
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
        // TODO Review
        // @ts-expect-error Needed?
        children({ segment: rest.segment, ...props })
      }
      {...rest}
    />
  ) : (
    <Route path={rest.segment.path} children={children} {...rest} />
  );
};
