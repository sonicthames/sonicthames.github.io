import { Link } from "@/components/ui"
import { cn } from "@/lib/utils"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { appRoute } from "../location"

export const Header = () => {
  const deviceType = useDeviceType()
  return (
    <header
      className="sticky top-0 z-10 text-white font-bold text-lg uppercase pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0) 500px, rgba(0, 0, 0, 0.6))",
      }}
    >
      <div
        className={cn(
          "flex justify-end gap-4 pb-4 pt-4",
          deviceType === "desktop" ? "mx-auto" : "px-4",
        )}
        style={deviceType === "desktop" ? { maxWidth: maxPageWidth } : {}}
      >
        <nav className="flex gap-4 pointer-events-auto [&_a]:text-white [&_a:visited]:text-white [&_a:hover]:opacity-80 [&_a]:transition-opacity">
          <Link variant="inherit" to={appRoute("listen").to({}).path}>
            Listen
          </Link>
          <Link variant="inherit" to={appRoute("see").to({}).path}>
            See
          </Link>
          <Link variant="inherit" to={appRoute("feel").to({}).path}>
            Feel
          </Link>
          <Link variant="inherit" to={appRoute("about").to({}).path}>
            About
          </Link>
          <Link variant="inherit" to={appRoute("contact").to({}).path}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}

export const PageHeader = () => {
  const deviceType = useDeviceType()
  return (
    <header className="sticky top-0 z-10 bg-primary-dark text-white font-bold text-lg uppercase pointer-events-auto">
      <div
        className={cn(
          "flex justify-end gap-4 pb-4 pt-4",
          deviceType === "desktop" ? "mx-auto" : "px-4",
        )}
        style={deviceType === "desktop" ? { maxWidth: maxPageWidth } : {}}
      >
        <strong className="flex-1">Sonicthames</strong>
        <nav className="flex gap-4 [&_a]:text-white [&_a:visited]:text-white [&_a:hover]:opacity-80 [&_a]:transition-opacity">
          <Link variant="inherit" to={appRoute("main").to({}).path}>
            Map
          </Link>
          <Link variant="inherit" to={appRoute("listen").to({}).path}>
            Listen
          </Link>
          <Link variant="inherit" to={appRoute("see").to({}).path}>
            See
          </Link>
          <Link variant="inherit" to={appRoute("feel").to({}).path}>
            Feel
          </Link>
          <Link variant="inherit" to={appRoute("about").to({}).path}>
            About
          </Link>
          <Link variant="inherit" to={appRoute("contact").to({}).path}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}
