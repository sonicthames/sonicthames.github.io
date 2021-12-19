import { css } from "@emotion/css";
import { ThemeProvider } from "@material-ui/core";
import * as E from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { History } from "history";
import React, { useEffect, useState } from "react";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { D_Data } from "./data";
import rawData from "./data.json";
import { AboutPage } from "./pages/about/Page";
import { ErrorBoundary } from "./pages/common/ErrorBoundary";
import { Header } from "./pages/common/Header";
import { ContactPage } from "./pages/contact/Page";
import { CrashPage } from "./pages/crash/Page";
import { appRoute, soundId } from "./pages/location";
import { Map } from "./pages/main/Map";
import { NotFoundPage } from "./pages/not-found/Page";
import { SoundPage } from "./pages/sound/Page";
import { SoundsPage } from "./pages/sounds/Page";
import { makeCommonStyles } from "./pages/styles";
import { useDeviceType } from "./theme/media";
import { theme } from "./theme/theme";

const ShowDrawer = ({
  set,
  show = false,
}: {
  set: React.Dispatch<React.SetStateAction<boolean>>;
  show?: boolean;
}) => {
  useEffect(() => set(show), [set, show]);

  return <></>;
};

interface Props {
  readonly history: History;
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
            <Map history={history} sounds={sounds} />
          </div>
          {/* TODO Maybe use a simple effect instead...? */}
          <Switch>
            <Route path={appRoute("main").path}>
              <ShowDrawer set={setShowDrawer} />
            </Route>
            <Route path="*">
              <ShowDrawer set={setShowDrawer} show />
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
                path={appRoute("sound", ":sound").path}
                render={(props) =>
                  pipe(
                    sounds,
                    RA.findFirst(
                      (s) => soundId(s) === props.match.params.sound
                    ),
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
  return {
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
