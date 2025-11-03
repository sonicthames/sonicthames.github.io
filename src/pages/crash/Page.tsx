import {
  errorContainer,
  errorMessage,
  errorTitle,
} from "@/ui/components/error.css"
import { pageMain, pageMainVariants, pageRoot } from "@/ui/components/page.css"
import { maxPageWidth, useDeviceType } from "../../theme/media"

interface Props {
  readonly error: Error
}

export const CrashPage = ({ error }: Props) => {
  const deviceType = useDeviceType()
  return (
    <div className={pageRoot}>
      <main
        className={`${pageMain} ${pageMainVariants[deviceType]}`}
        style={
          deviceType === "desktop" ? { maxWidth: maxPageWidth } : undefined
        }
      >
        <div className={errorContainer}>
          <h1 className={errorTitle}>Opps! Something happened...</h1>
          <div className={errorMessage}>{error.message}</div>
        </div>
      </main>
    </div>
  )
}
