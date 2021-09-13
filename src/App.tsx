import { css } from "@emotion/css";
import { ThemeProvider } from "@material-ui/core";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { History } from "history";
import React, { useState } from "react";
import { Marker } from "react-map-gl";
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
import { brandColors } from "./theme/colors";
import { theme } from "./theme/theme";
import { makeCommonStyles } from "./pages/styles";
import { useDeviceType } from "./theme/media";

interface Props {
  history: History<unknown>;
}

export const App = ({ history }: Props) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const styles = makeStyles({ showDrawer });

  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <Router history={history}>
      <ErrorBoundary fallback={(error) => <CrashPage error={error} />}>
        <ThemeProvider theme={theme}>
          <Header />
          <div className={styles.map}>
            <Map>
              {pipe(
                sounds,
                RA.map((s) => (
                  <Marker latitude={s.position.lat} longitude={s.position.lng}>
                    <div className={styles.marker}>
                      <img
                        src={s.thumbnailSrc}
                        alt={`${s.title} thumbnail`}
                        width={30}
                        height={30}
                      />
                      <div>{s.title}</div>
                    </div>
                  </Marker>
                ))
              )}
            </Map>
          </div>
          <Switch>
            <Route path="/main">
              {() => {
                setShowDrawer(false);
                return <></>;
              }}
            </Route>
            <Route path="*">
              {() => {
                setShowDrawer(true);
                return <></>;
              }}
            </Route>
          </Switch>
          <div className={styles.pages}>
            <Switch>
              <Route path="/main">
                <div className={commonStyles.page} />
              </Route>
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
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
};

const makeStyles = ({ showDrawer }: { showDrawer: boolean }) =>
  ({
    marker: css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: brandColors.main.light,
    }),
    map: css({ position: "absolute", zIndex: 0 }),
    pages: css({
      position: "absolute",
      transform: showDrawer ? "translateX(0)" : "translateX(100%)",
      transition: "transform 100ms",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      zIndex: 500,
    }),
  } as const);
