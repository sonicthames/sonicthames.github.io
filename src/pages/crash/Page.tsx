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
