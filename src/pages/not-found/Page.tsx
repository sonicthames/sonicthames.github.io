import { Link } from "@/components/ui"
import { appRoute } from "@/pages/location"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { errorContainer, errorMessage, errorTitle } from "../common/error.css"
import { PageHeader } from "../common/Header"
import { pageMain, pageMainVariants, pageRoot } from "../common/layout.css"

export const NotFoundPage = () => {
  const deviceType = useDeviceType()
  return (
    <div className={pageRoot}>
      <PageHeader title="Page not found" />
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <div className={errorContainer}>
          <h1 className={errorTitle}>Page not found</h1>
          <p className={errorMessage}>This page doesn't exist or has moved.</p>
          <p className={errorMessage}>
            <Link to={appRoute("main").to({}).path}>Back to the map</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
