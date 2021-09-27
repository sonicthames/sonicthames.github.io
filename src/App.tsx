import { css } from "@emotion/css";
import { ThemeProvider } from "@material-ui/core";
import { identity, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import rawData from "./data.json";
import * as RA from "fp-ts/ReadonlyArray";
import { History } from "history";
import React, { useState } from "react";
import { Marker } from "react-map-gl";
import * as E from "fp-ts/Either";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { D_Data, sounds } from "./data";
import { Icon } from "./icon";
import { AboutPage } from "./pages/about/Page";
import { ErrorBoundary } from "./pages/common/ErrorBoundary";
import { Header } from "./pages/common/Header";
import { ContactPage } from "./pages/contact/Page";
import { CrashPage } from "./pages/crash/Page";
import { appRoute } from "./pages/location";
import { Map } from "./pages/main/Map";
import { NotFoundPage } from "./pages/not-found/Page";
import { makeCommonStyles } from "./pages/styles";
import { WorkPage } from "./pages/work/Page";
import { WorksPage } from "./pages/works/Page";
import { useDeviceType } from "./theme/media";
import { theme } from "./theme/theme";
import { brandColors, colorToCssRGB } from "./theme/colors";
import { spaceEm, spaceRem } from "./theme/spacing";
import { fontSize } from "./theme/fontSize";

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
                rawData,
                D_Data.decode,
                E.fold(() => [], identity),
                (x) => {
                  console.log(x);
                  return x;
                },
                RA.map((s) => (
                  <Marker
                    latitude={s.coordinates.lat}
                    longitude={s.coordinates.lng}
                    className={styles.marker}
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
                  </Marker>
                ))
              )}
              {/* {pipe(
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
                      <div>{s.title}</div>
                    </div>
                  </Marker>
                ))
              )} */}
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
              <Route path={appRoute("works").path}>
                <WorksPage sounds={sounds} />
              </Route>
              <Route
                path={appRoute("works", ":work").path}
                render={(props) =>
                  pipe(
                    sounds,
                    RA.lookup(+props.match.params.work),
                    O.fold(
                      () => <NotFoundPage />,
                      (work) => <WorkPage sound={work} />
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
    background: colorToCssRGB(brandColors.neve.primary),
    fontSize: fontSize("s"),
    padding: spaceEm("xxs"),
    borderRadius: spaceRem(),
  });
  return {
    marker: css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      // backgroundColor: brandColors.main.light,
      cursor: "pointer",
      "&:hover": css({
        zIndex: 1000,
        div: css({
          border: `1px solid ${colorToCssRGB(brandColors.action.dark)}`,
        }),
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
