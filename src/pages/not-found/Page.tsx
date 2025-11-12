import { maxPageWidth, useDeviceType } from "../../theme/media"
import { errorContainer, errorTitle } from "../common/error.css"
import { PageHeader } from "../common/Header"
import { pageMain, pageMainVariants, pageRoot } from "../common/layout.css"

/**
 */
export const NotFoundPage = () => {
  const deviceType = useDeviceType()
  return (
    <div className={pageRoot}>
      <PageHeader />
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <div className={errorContainer}>
          <h1 className={errorTitle}>Page not found!</h1>
        </div>
      </main>
    </div>
  )
}
