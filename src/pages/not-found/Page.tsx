import { useDeviceType } from "../../theme/media"
import { PageHeader } from "../common/Header"
import { makeCommonStyles } from "../styles"

/**
 */
export const NotFoundPage = () => {
  const deviceType = useDeviceType()
  const commonStyles = makeCommonStyles(deviceType)
  return (
    <div className={commonStyles.page}>
      <PageHeader />
      <main className={commonStyles.main} style={commonStyles.mainStyle}>
        <div className="mt-12">
          <h1 className="text-2xl font-bold">Page not found!</h1>
        </div>
      </main>
    </div>
  )
}
