import { Link } from "@/components/ui"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { appRoute } from "../location"
import {
  brand,
  headerInner,
  headerRoot,
  nav,
  navLink,
  pageHeader,
} from "./Header.css"

export const Header = () => {
  const deviceType = useDeviceType()
  return (
    <header className={headerRoot}>
      <div
        className={headerInner}
        style={
          deviceType === "desktop"
            ? { maxWidth: maxPageWidth, margin: "0 auto" }
            : undefined
        }
      >
        <nav className={nav}>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("listen").to({}).path}
          >
            Listen
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("see").to({}).path}
          >
            See
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("feel").to({}).path}
          >
            Feel
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("about").to({}).path}
          >
            About
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("contact").to({}).path}
          >
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
    <header className={pageHeader}>
      <div
        className={headerInner}
        style={
          deviceType === "desktop"
            ? { maxWidth: maxPageWidth, margin: "0 auto" }
            : undefined
        }
      >
        <strong className={brand}>Sonicthames</strong>
        <nav className={nav}>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("main").to({}).path}
          >
            Map
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("listen").to({}).path}
          >
            Listen
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("see").to({}).path}
          >
            See
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("feel").to({}).path}
          >
            Feel
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("about").to({}).path}
          >
            About
          </Link>
          <Link
            className={navLink}
            variant="inherit"
            to={appRoute("contact").to({}).path}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}
