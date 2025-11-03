import { errorContainer, errorTitle } from "@/ui/components/error.css"
import { pageMain, pageMainVariants, pageRoot } from "@/ui/components/page.css"
import { maxPageWidth, useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"

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
