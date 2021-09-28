import { css, cx } from "@emotion/css";
import { brandColors, colorToCssRGB } from "../theme/colors";
import { DeviceType } from "../theme/device";
import { fontSize } from "../theme/fontSize";
import { maxPageSize, spaceRem } from "../theme/spacing";

export const makeCommonStyles = (deviceType: DeviceType) =>
  ({
    page: css({
      display: "flex",
      flex: 1,
      flexDirection: "column",
      position: "relative",
      backgroundColor: colorToCssRGB(brandColors.main.light),
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
    crest: css({
      fontSize: fontSize("xl"),
    }),
  } as const);
