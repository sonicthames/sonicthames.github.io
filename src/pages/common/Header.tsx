import { NavLink } from "react-router"
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

const pageLinks = [
  [appRoute("listen").to({}).path, "Listen"],
  [appRoute("see").to({}).path, "See"],
  [appRoute("feel").to({}).path, "Feel"],
  [appRoute("about").to({}).path, "About"],
  [appRoute("contact").to({}).path, "Contact"],
] as const

const Nav = ({ withMap }: { readonly withMap: boolean }) => (
  <nav className={nav}>
    {withMap ? (
      <NavLink className={navLink} to={appRoute("main").to({}).path}>
        Map
      </NavLink>
    ) : null}
    {pageLinks.map(([path, label]) => (
      <NavLink key={path} className={navLink} to={path}>
        {label}
      </NavLink>
    ))}
  </nav>
)

const useInnerStyle = () =>
  useDeviceType() === "desktop"
    ? { maxWidth: maxPageWidth, margin: "0 auto" }
    : undefined

export const Header = () => {
  const innerStyle = useInnerStyle()
  return (
    <header className={headerRoot}>
      <div className={headerInner} style={innerStyle}>
        <Nav withMap={false} />
      </div>
    </header>
  )
}

export const PageHeader = () => {
  const innerStyle = useInnerStyle()
  return (
    <header className={pageHeader}>
      <div className={headerInner} style={innerStyle}>
        <strong className={brand}>Sonic Thames</strong>
        <Nav withMap />
      </div>
    </header>
  )
}
