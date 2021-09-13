import { css } from "@emotion/css";
import { ThemeProvider } from "@material-ui/core";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { History } from "history";
import React from "react";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { sounds } from "./data";
import { AboutPage } from "./pages/about/Page";
import { ErrorBoundary } from "./pages/common/ErrorBoundary";
import { Header } from "./pages/common/Header";
import { ContactPage } from "./pages/contact/Page";
import { CrashPage } from "./pages/crash/Page";
import { Map } from "./pages/main/Map";
import { NotFoundPage } from "./pages/not-found/Page";
import { WorkPage } from "./pages/work/Page";
import { WorksPage } from "./pages/works/Page";
import { theme } from "./theme/theme";

interface Props {
  history: History<unknown>;
}

export const App = ({ history }: Props) => (
  <Router history={history}>
    <ErrorBoundary fallback={(error) => <CrashPage error={error} />}>
      <ThemeProvider theme={theme}>
        {/* sounds={sounds} */}
        <Header />
        <div className={styles.map}>
          <Map />
        </div>
        <Switch>
          <Route path="/main"></Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/works">
            <WorksPage sounds={sounds} />
          </Route>
          <Route path="/work/:index">
            {(props) =>
              pipe(
                props.match?.params.index,
                O.fromNullable,
                O.chain((index) => pipe(sounds, RA.lookup(+index))),
                O.fold(
                  () => <NotFoundPage />,
                  (sound) => <WorkPage sound={sound} />
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

const styles = {
  map: css({ position: "absolute", zIndex: 0 }),
} as const;
