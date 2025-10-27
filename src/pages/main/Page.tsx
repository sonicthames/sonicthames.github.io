import { useDeviceType } from "../../theme/media"
import { makeCommonStyles } from "../styles"

/**
 */
export const MainPage = () => {
  const deviceType = useDeviceType()
  const commonStyles = makeCommonStyles(deviceType)
  return (
    <div className={commonStyles.page}>
      <main />
    </div>
  )
}
