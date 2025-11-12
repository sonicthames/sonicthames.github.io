import {
  drawer,
  drawerBackdrop,
  drawerPanel,
  sidePanel,
} from "@ui/components/map.css"
import * as E from "fp-ts/Either"
import { identity, pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import type { ReactElement } from "react"
import { useEffect } from "react"
import {
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom"
import {
  appContainer,
  appHeaderLayer,
  appMapLayer,
  pageRoot,
} from "@/pages/common/layout.css"
import { D_Data } from "./data.io"
import rawData from "./data.json"
import type { Sound } from "./domain/base"
import { AboutPage } from "./pages/about/Page"
import { ErrorBoundary } from "./pages/common/ErrorBoundary"
import { Header } from "./pages/common/Header"
import { ContactPage } from "./pages/contact/Page"
import { CrashPage } from "./pages/crash/Page"
import { appRoute, soundId } from "./pages/location"
import { MainMap } from "./pages/main/Map"
import { NotFoundPage } from "./pages/not-found/Page"
import { SoundPage } from "./pages/sound/Page"
import { SoundsPage } from "./pages/sounds/Page"

const shouldShowDrawer = (pathname: string) => {
  return !matchPath({ path: appRoute("main").path, end: true }, pathname)
}

export const App = () => {
  const sounds = pipe(
    rawData,
    D_Data.decode,
    E.fold((e) => {
      throw new Error(JSON.stringify(e))
    }, identity),
  )

  return <AppContent sounds={sounds} />
}

const AppContent = ({ sounds }: { readonly sounds: ReadonlyArray<Sound> }) => {
  const location = useLocation()
  const showDrawer = shouldShowDrawer(location.pathname)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const wrapWithPage = (node: ReactElement) => (
    <div className={pageRoot}>{node}</div>
  )

  const renderRoutes = (wrapper: (node: ReactElement) => ReactElement) => (
    <Routes>
      <Route path={appRoute("main").path} element={null} />
      <Route path={appRoute("about").path} element={wrapper(<AboutPage />)} />
      <Route
        path={appRoute("listen").path}
        element={wrapper(
          <SoundsPage
            category="Listen"
            sounds={pipe(
              sounds,
              RA.filter((x) => x.category === "Listen"),
            )}
          />,
        )}
      />
      <Route
        path={appRoute("see").path}
        element={wrapper(
          <SoundsPage
            category="See"
            sounds={pipe(
              sounds,
              RA.filter((x) => x.category === "See"),
            )}
          />,
        )}
      />
      <Route
        path={appRoute("feel").path}
        element={wrapper(
          <SoundsPage
            category="Feel"
            sounds={pipe(
              sounds,
              RA.filter((x) => x.category === "Feel"),
            )}
          />,
        )}
      />
      <Route
        path={appRoute("sound", ":sound").path}
        element={wrapper(<SoundRoute sounds={sounds} />)}
      />
      <Route
        path={appRoute("contact").path}
        element={wrapper(<ContactPage />)}
      />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )

  return (
    <ErrorBoundary fallback={(error) => <CrashPage error={error} />}>
      <div className={appContainer}>
        <div className={appMapLayer}>
          <MainMap sounds={sounds} />
        </div>
        <div className={appHeaderLayer}>
          <Header />
        </div>
        <div className={drawer({ open: showDrawer })}>
          {showDrawer ? (
            <>
              <div className={drawerBackdrop} />
              <div className={drawerPanel}>{renderRoutes(wrapWithPage)}</div>
            </>
          ) : (
            <div className={sidePanel}>{renderRoutes(wrapWithPage)}</div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

const SoundRoute = ({ sounds }: { readonly sounds: ReadonlyArray<Sound> }) => {
  const params = useParams<{ sound?: string }>()

  return pipe(
    params.sound,
    O.fromNullable,
    O.chain((soundParam) =>
      pipe(
        sounds,
        RA.findFirst((s) => soundId(s) === soundParam),
      ),
    ),
    O.fold(
      () => <NotFoundPage />,
      (sound) => <SoundPage sound={sound} />,
    ),
  )
}

const RootRedirect = () => {
  const location = useLocation()

  if (location.search.startsWith("?/")) {
    return <Navigate to={location.search.substring(1)} replace />
  }

  return <Navigate to={appRoute("main").to({}).path} replace />
}
