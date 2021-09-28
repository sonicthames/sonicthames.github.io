import { css } from "@emotion/css";
import { ThemeProvider } from "@material-ui/core";
import * as E from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { History } from "history";
import React, { useState } from "react";
import { Marker } from "react-map-gl";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { D_Data } from "./data";
import rawData from "./data.json";
import { R_CategoryRoute } from "./domain/base";
import { Icon } from "./icon";
import { AboutPage } from "./pages/about/Page";
import { ErrorBoundary } from "./pages/common/ErrorBoundary";
import { Header } from "./pages/common/Header";
import { ContactPage } from "./pages/contact/Page";
import { CrashPage } from "./pages/crash/Page";
import { appRoute } from "./pages/location";
import { Map } from "./pages/main/Map";
import { NotFoundPage } from "./pages/not-found/Page";
import { SoundPage } from "./pages/sound/Page";
import { SoundsPage } from "./pages/sounds/Page";
import { makeCommonStyles } from "./pages/styles";
import { fontSize } from "./theme/fontSize";
import { useDeviceType } from "./theme/media";
import { spaceEm } from "./theme/spacing";
import { theme } from "./theme/theme";

interface Props {
  history: History<unknown>;
}

export const App = ({ history }: Props) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const styles = makeStyles({ showDrawer });

  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);

  const sounds = pipe(
    rawData,
    D_Data.decode,
    E.fold((e) => {
      throw new Error(JSON.stringify(e));
    }, identity)
  );

  return (
    <Router history={history}>
      <ErrorBoundary fallback={(error) => <CrashPage error={error} />}>
        <ThemeProvider theme={theme}>
          <Header />
          <div className={styles.map}>
            <Map>
              {pipe(
                sounds,
                RA.mapWithIndex((k, s) => (
                  <Marker
                    latitude={s.coordinates.lat}
                    longitude={s.coordinates.lng}
                    className={styles.marker}
                  >
                    <div
                      onClick={() => {
                        history.push(
                          `/${R_CategoryRoute[s.category]}/${k}`
                          // REVIEW
                          // appRoute(R_CategoryRoute[s.category], ":sound").to({
                          //   sound: k.toString(),
                          // }).path
                        );
                      }}
                    >
                      {((c) => {
                        switch (c) {
                          case "Listen":
                            return (
                              <Icon
                                name="MarkerL"
                                width="2.5rem"
                                height="2.5rem"
                              />
                            );
                          case "See":
                            return (
                              <Icon
                                name="MarkerS"
                                width="2.5rem"
                                height="2.5rem"
                              />
                            );
                          case "Feel":
                            return (
                              <Icon
                                name="MarkerF"
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
                      <div className={styles.markerNote}>{s.marker}</div>
                    </div>
                  </Marker>
                ))
              )}
            </Map>
          </div>
          <Switch>
            <Route path={appRoute("main").path}>
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
              <Route path={appRoute("main").path}>
                <div className={commonStyles.page} />
              </Route>
              <Route path={appRoute("about").path}>
                <AboutPage />
              </Route>
              <Route path={appRoute("listen").path}>
                <SoundsPage
                  category="Listen"
                  sounds={pipe(
                    sounds,
                    RA.filter((x) => x.category === "Listen")
                  )}
                />
              </Route>
              <Route path={appRoute("see").path}>
                <SoundsPage
                  category="See"
                  sounds={pipe(
                    sounds,
                    RA.filter((x) => x.category === "See")
                  )}
                />
              </Route>
              <Route path={appRoute("feel").path}>
                <SoundsPage
                  category="Feel"
                  sounds={pipe(
                    sounds,
                    RA.filter((x) => x.category === "Feel")
                  )}
                />
              </Route>
              <Route
                path={appRoute("sounds", ":sound").path}
                render={(props) =>
                  pipe(
                    sounds,
                    RA.findFirst((x) => x.marker === props.match.params.sound),
                    O.fold(
                      () => <NotFoundPage />,
                      (sound) => <SoundPage sound={sound} />
                    )
                  )
                }
              />
              <Route path={appRoute("contact").path}>
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
                          <Redirect to={appRoute("main").to({}).path} />
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

const makeStyles = ({ showDrawer }: { showDrawer: boolean }) => {
  const markerNote = css({
    // backgroundColor: colorToCssRGB(brandColors.neve.primary),
    boxSizing: "content-box",
    fontSize: fontSize("s"),
    padding: spaceEm("xxs"),
    // borderRadius: spaceRem(),
    cursor: "pointer",
  });
  return {
    marker: css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      // backgroundColor: brandColors.main.light,
      cursor: "pointer",
      svg: css({
        cursor: "pointer",
      }),
      "&:hover": css({
        zIndex: 1000,
        // Removed
        // "> div": css({
        //   div: css({
        //     border: `2px solid ${colorToCssRGB(brandColors.action.dark)}`,
        //   }),
        // }),
      }),
    }),
    markerNote,
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
  } as const;
};
