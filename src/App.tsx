import { ThemeProvider } from "@material-ui/core";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RR from "fp-ts/ReadonlyRecord";
import { History } from "history";
import React from "react";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { Sound, Work } from "./domain/base";
import { ErrorBoundary } from "./pages/common/ErrorBoundary";
import { ContactPage } from "./pages/contact/Page";
import { CrashPage } from "./pages/crash/Page";
import { MainPage } from "./pages/main/Page";
import { NotFoundPage } from "./pages/not-found/Page";
import { WorkPage } from "./pages/work/Page";
import { theme } from "./theme/theme";

const works: Readonly<Record<string, [Work, Sound]>> = {};

interface Props {
  history: History<unknown>;
}

export const App = ({ history }: Props) => (
  <Router history={history}>
    <ErrorBoundary fallback={(error) => <CrashPage error={error} />}>
      <ThemeProvider theme={theme}>
        <Switch>
          <Route path="/main">
            <MainPage />
          </Route>
          <Route path="/work/:index">
            {(props) =>
              pipe(
                props.match?.params.index,
                O.fromNullable,
                O.chain((index) => pipe(works, RR.lookup(index))),
                O.fold(
                  () => <NotFoundPage />,
                  ([work, sound]) => <WorkPage work={work} sound={sound} />
                )
              )
            }
          </Route>
          <Route path="/contact">
            <ContactPage />
          </Route>
          <Route path="*">
            {(props) =>
              pipe(props.location, (l) =>
                l.pathname === "/" && l.search.startsWith("?/") ? (
                  <Redirect to={l.search.substr(1)} />
                ) : (
                  <Switch>
                    <Route exact path="/">
                      <Redirect to="/main" />
                    </Route>
                    <Route path="*">
                      <NotFoundPage />
                    </Route>
                  </Switch>
                )
              )
            }
          </Route>
        </Switch>
      </ThemeProvider>
    </ErrorBoundary>
  </Router>
);
