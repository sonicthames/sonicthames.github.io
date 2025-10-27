import { useDeviceType } from "../../theme/media"
import { makeCommonStyles } from "../styles"

interface Props {
  readonly error: Error
}

export const CrashPage = ({ error }: Props) => {
  const deviceType = useDeviceType()
  const commonStyles = makeCommonStyles(deviceType)
  return (
    <div className={commonStyles.page}>
      <main className={commonStyles.main} style={commonStyles.mainStyle}>
        <div className="mt-12">
          <h1 className="text-2xl font-bold">Opps! Something happened...</h1>
          <div className="mt-4">{error.message}</div>
        </div>
      </main>
    </div>
  )
}
