import { Link } from "@/components/ui"
import { appRoute } from "@/pages/location"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { errorContainer, errorMessage, errorTitle } from "../common/error.css"
import { pageMain, pageMainVariants, pageRoot } from "../common/layout.css"

interface Props {
  readonly error: Error
}

export const CrashPage = ({ error }: Props) => {
  const deviceType = useDeviceType()
  return (
    <div className={pageRoot}>
      <title>Something went wrong · Sonic Thames</title>
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <div className={errorContainer}>
          <h1 className={errorTitle}>Oops! Something happened...</h1>
          <p className={errorMessage}>
            {/* Navigating to the route that crashed would not reset the boundary. */}
            <Link to={appRoute("main").to({}).path} reloadDocument>
              Back to the map
            </Link>
          </p>
          <details className={errorMessage}>
            <summary>Details</summary>
            <pre>{error.message}</pre>
          </details>
        </div>
      </main>
    </div>
  )
}
