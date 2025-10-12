import { css, cx } from "@emotion/css";
import { Link } from "@material-ui/core";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { brandColors, colorToCssRGB } from "../../theme/colors";
import type { DeviceType } from "../../theme/device";
import { fontSize } from "../../theme/fontSize";
import { maxPageWidth, useDeviceType } from "../../theme/media";
import { spacingRem } from "../../theme/spacing";
import { appRoute } from "../location";

export const Header = () => {
  const deviceType = useDeviceType();
  const styles = makeCommonStyles({ deviceType });
  return (
    <header className={styles.component}>
      <div className={cx(styles.content)}>
        <nav
          className={css({
            pointerEvents: "initial",
          })}
        >
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("listen").to({}).path}
          >
            Listen
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("see").to({}).path}
          >
            See
          </Link>

          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("feel").to({}).path}
          >
            Feel
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("about").to({}).path}
          >
            About
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("contact").to({}).path}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export const PageHeader = () => {
  const deviceType = useDeviceType();
  const styles = makeCommonStyles({ deviceType });
  const pageStyles = makePageHeaderStyles({ deviceType });
  return (
    <header className={cx(styles.component, pageStyles.component)}>
      <div className={styles.content}>
        <strong>Sonicthames</strong>
        <nav>
          {/* TODO Link with unsafeTo */}
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("main").to({}).path}
          >
            Map
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("listen").to({}).path}
          >
            Listen
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("see").to({}).path}
          >
            See
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("feel").to({}).path}
          >
            Feel
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("about").to({}).path}
          >
            About
          </Link>
          <Link
            color="initial"
            component={RouterLink}
            to={appRoute("contact").to({}).path}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

const makeCommonStyles = ({
  deviceType,
}: {
  readonly deviceType: DeviceType;
}) =>
  ({
    component: css({
      position: "sticky",
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0) 500px, rgba(0, 0, 0, 0.6))",
      // backgroundColor: colorToCssRGBA([...brandColors.neutral.main, 0.7]),
      color: "white",
      fontSize: fontSize("l"),
      fontWeight: "bold",
      gap: spacingRem(),
      pointerEvents: "none",
      textTransform: "uppercase",
      top: 0,
      zIndex: 1,
      nav: css({
        display: "flex",
        gap: spacingRem(),
      }),
    }),
    content: cx(
      css({
        strong: css({
          flex: 1,
        }),
        // REVIEW
        display: "flex",
        justifyContent: "flex-end",
        gap: spacingRem(),
        paddingBottom: spacingRem(),
        paddingTop: spacingRem(),
        a: css({
          color: "white",
          "&:visited": css({
            color: "white",
          }),
        }),
      }),
      deviceType === "desktop"
        ? css({
            margin: "0 auto",
            maxWidth: maxPageWidth,
          })
        : css({
            paddingLeft: spacingRem(),
            paddingRight: spacingRem(),
          })
    ),
  } as const);

const makePageHeaderStyles = ({
  deviceType,
}: {
  readonly deviceType: DeviceType;
}) =>
  ({
    component: css({
      backgroundColor: colorToCssRGB(brandColors.main.dark),
      fontSize: fontSize("l"),
      gap: spacingRem(),
      pointerEvents: "initial",
      position: "sticky",
      textTransform: "uppercase",
      top: 0,
      zIndex: 1,
      nav: css({
        display: "flex",
        gap: spacingRem(),
      }),
    }),
  } as const);
