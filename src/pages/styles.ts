import { css, cx } from "@emotion/css";
import { brandColors } from "../theme/colors";
import { DeviceType } from "../theme/device";
import { maxPageSize, spaceRem } from "../theme/spacing";

export const makeCommonStyles = (deviceType: DeviceType) =>
  ({
    page: css({
      display: "flex",
      flex: 1,
      flexDirection: "column",
      position: "relative",
      backgroundColor: brandColors.neve.primary,
    }),
    // TODO Should be main
    main: cx(
      css({ flex: 1 }),
      deviceType === "desktop"
        ? css({
            margin: "0 auto",
            width: "100%",
            maxWidth: maxPageSize,
          })
        : css({
            padding: `0 ${spaceRem()}`,
          })
    ),
  } as const);
