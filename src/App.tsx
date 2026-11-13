import { drawer, drawerPanel } from "@ui/components/map.css"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as RA from "fp-ts/ReadonlyArray"
import * as D from "io-ts/Decoder"
import { lazy, Suspense, useEffect, useRef } from "react"
import {
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router"
import {
  appContainer,
  appHeaderLayer,
  appMapLayer,
} from "@/pages/common/layout.css"
import rawData from "./data.json" with { type: "json" }
import type { Category, Sound } from "./domain/sound"
import { D_Data } from "./domain/sound"
import { MainMap } from "./features/map"
import { ErrorBoundary } from "./pages/common/ErrorBoundary"
import { Header } from "./pages/common/Header"
import { CrashPage } from "./pages/crash/Page"
import { appRoute, soundId } from "./pages/location"

const AboutPage = lazy(() =>
  import("./pages/about/Page").then((m) => ({ default: m.AboutPage })),
)
const ContactPage = lazy(() =>
  import("./pages/contact/Page").then((m) => ({ default: m.ContactPage })),
)
const SoundPage = lazy(() =>
  import("./pages/sound/Page").then((m) => ({ default: m.SoundPage })),
)
const SoundsPage = lazy(() =>
  import("./pages/sounds/Page").then((m) => ({ default: m.SoundsPage })),
)
const NotFoundPage = lazy(() =>
  import("./pages/not-found/Page").then((m) => ({ default: m.NotFoundPage })),
)

const decodedSounds = D_Data.decode(rawData)

const mainPath = appRoute("main").to({}).path

const shouldShowDrawer = (pathname: string) =>
  !matchPath({ path: appRoute("main").path, end: true }, pathname)

export const App = () => {
  const location = useLocation()
  return (
    <ErrorBoundary
      resetKey={location.pathname}
      fallback={(error) => <CrashPage error={error} />}
    >
      <AppContent />
    </ErrorBoundary>
  )
}

const AppContent = () => {
  const sounds = pipe(
    decodedSounds,
    E.getOrElseW((errors) => {
      throw new Error(D.draw(errors))
    }),
  )
  const location = useLocation()
  const navigate = useNavigate()
  const showDrawer = shouldShowDrawer(location.pathname)
  const drawerPanelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const rememberFocus = (event: FocusEvent) => {
      if (
        event.target instanceof HTMLElement &&
        !drawerPanelRef.current?.contains(event.target)
      ) {
        returnFocusRef.current = event.target
      }
    }
    document.addEventListener("focusin", rememberFocus)
    return () => {
      document.removeEventListener("focusin", rememberFocus)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus moves to each newly opened page
  useEffect(() => {
    if (showDrawer) {
      drawerPanelRef.current?.focus({ preventScroll: true })
      return
    }
    const focused = document.activeElement
    if (
      focused === document.body ||
      drawerPanelRef.current?.contains(focused)
    ) {
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [showDrawer, location.pathname])

  useEffect(() => {
    if (!showDrawer) {
      return
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      // Leaving from a field would throw away what was typed.
      const inField =
        event.target instanceof Element &&
        event.target.closest("input, textarea, select") !== null
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !event.isComposing &&
        !inField
      ) {
        void navigate(mainPath)
      }
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [showDrawer, navigate])

  const soundsIn = (category: Category) =>
    pipe(
      sounds,
      RA.filter((x) => x.category === category),
    )

  return (
    <div className={appContainer}>
      <div className={appMapLayer} inert={showDrawer}>
        <MainMap sounds={sounds} />
      </div>
      <div className={appHeaderLayer} inert={showDrawer}>
        <Header />
      </div>
      <div className={drawer({ open: showDrawer })} inert={!showDrawer}>
        <div ref={drawerPanelRef} className={drawerPanel} tabIndex={-1}>
          <Suspense key={location.pathname}>
            <Routes>
              <Route path={appRoute("main").path} element={null} />
              <Route path={appRoute("about").path} element={<AboutPage />} />
              <Route
                path={appRoute("listen").path}
                element={
                  <SoundsPage category="Listen" sounds={soundsIn("Listen")} />
                }
              />
              <Route
                path={appRoute("see").path}
                element={<SoundsPage category="See" sounds={soundsIn("See")} />}
              />
              <Route
                path={appRoute("feel").path}
                element={
                  <SoundsPage category="Feel" sounds={soundsIn("Feel")} />
                }
              />
              <Route
                path={appRoute("sound", ":sound").path}
                element={<SoundRoute sounds={sounds} />}
              />
              <Route
                path={appRoute("contact").path}
                element={<ContactPage />}
              />
              <Route path="/" element={<Navigate to={mainPath} replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
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
