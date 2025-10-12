import { css, cx } from "@emotion/css";
import { brandColors, colorToCssRGB } from "../theme/colors";
import type { DeviceType } from "../theme/device";
import { fontSize } from "../theme/fontSize";
import { maxPageWidth } from "../theme/media";
import { spacingRem } from "../theme/spacing";

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
            maxWidth: maxPageWidth,
          })
        : css({
            padding: `0 ${spacingRem()}`,
          })
    ),
    crest: css({
      fontSize: fontSize("xl"),
    }),
  } as const);
