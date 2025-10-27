import { cn } from "@/lib/utils"
import type { DeviceType } from "../theme/device"
import { maxPageWidth } from "../theme/media"

export const makeCommonStyles = (deviceType: DeviceType) => ({
  page: "flex flex-1 flex-col relative bg-primary-light overflow-y-auto",
  main: cn("flex-1", deviceType === "desktop" ? "mx-auto w-full" : "px-4"),
  mainStyle: deviceType === "desktop" ? { maxWidth: maxPageWidth } : {},
  crest: "text-4xl",
})
