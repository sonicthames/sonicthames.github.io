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
import { Icon } from "./icon";
import { AboutPage } from "./pages/about/Page";
import { ErrorBoundary } from "./pages/common/ErrorBoundary";
import { Header } from "./pages/common/Header";
import { ContactPage } from "./pages/contact/Page";
import { CrashPage } from "./pages/crash/Page";
import { routePathAbsolute } from "./pages/location";
import { Map } from "./pages/main/Map";
import { NotFoundPage } from "./pages/not-found/Page";
import { makeCommonStyles } from "./pages/styles";
import { WorkPage } from "./pages/work/Page";
import { WorksPage } from "./pages/works/Page";
import { useDeviceType } from "./theme/media";
import { theme } from "./theme/theme";

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
                      {((c) => {
                        switch (c) {
                          case "Binaural Cycling":
                            return (
                              <Icon
                                name="MarkerB"
                                width="2.5rem"
                                height="2.5rem"
                              />
                            );
                          case "Sonic Sculptures":
                            return (
                              <Icon
                                name="MarkerS"
                                width="2.5rem"
                                height="2.5rem"
                              />
                            );
                          case "Sound Walks":
                            return (
                              <Icon
                                name="MarkerF"
                                width="2.5rem"
                                height="2.5rem"
                              />
                            );
                          case "Soundscapes":
                            return (
                              <Icon
                                name="MarkerL"
                                width="2.5rem"
                                height="2.5rem"
                              />
                            );
                        }
                      })(s.category)}
                      {/* <img
                        alt={`${s.title} thumbnail`}
                        width={30}
                        height={30}
                      /> */}
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
              <Route path={routePathAbsolute(["main"] as const).path}>
                <div className={commonStyles.page} />
              </Route>
              <Route path={routePathAbsolute(["about"] as const).path}>
                <AboutPage />
              </Route>
              <Route path={routePathAbsolute(["works"] as const).path}>
                <WorksPage sounds={sounds} />
              </Route>
              <Route path={routePathAbsolute(["works", ":work"] as const).path}>
                {(props) =>
                  pipe(
                    props.match?.params.work,
                    O.fromNullable,
                    O.chain((index) => pipe(sounds, RA.lookup(+index))),
                    O.fold(
                      () => <NotFoundPage />,
                      (sound) => <WorkPage sound={sound} />
                    )
                  )
                }
              </Route>
              <Route path={routePathAbsolute(["contact"] as const).path}>
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
                          <Redirect
                            to={routePathAbsolute(["main"] as const).path}
                          />
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
      // backgroundColor: brandColors.main.light,
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
