import { css, cx } from "@emotion/css";
import { Link } from "@material-ui/core";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { brandColors, colorToCssRGB } from "../../theme/colors";
import { DeviceType } from "../../theme/device";
import { fontSize } from "../../theme/fontSize";
import { useDeviceType } from "../../theme/media";
import { maxPageSize, spaceRem } from "../../theme/spacing";
import { appRoute } from "../location";

export const Header = () => {
  const deviceType = useDeviceType();
  const styles = makeCommonStyles({ deviceType });
  return (
    <header className={styles.component}>
      <div className={cx(styles.content)}>
        <nav>
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

const makeCommonStyles = ({ deviceType }: { deviceType: DeviceType }) =>
  ({
    component: css({
      position: "sticky",
      top: 0,
      // backgroundColor: brandColors.neutral.main,
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2))",
      // backgroundColor: colorToCssRGBA([...brandColors.neutral.main, 0.7]),
      color: "white",
      fontSize: fontSize("l"),
      fontWeight: "bold",
      gap: spaceRem(),
      textTransform: "uppercase",
      nav: css({
        display: "flex",
        gap: spaceRem(),
      }),
      zIndex: 1,
    }),
    content: cx(
      css({
        strong: css({
          flex: 1,
        }),
        // REVIEW
        display: "flex",
        justifyContent: "flex-end",
        gap: spaceRem(),
        paddingBottom: spaceRem(),
        paddingTop: spaceRem(),
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
            maxWidth: maxPageSize,
          })
        : css({
            paddingLeft: spaceRem(),
            paddingRight: spaceRem(),
          })
    ),
  } as const);

const makePageHeaderStyles = ({ deviceType }: { deviceType: DeviceType }) =>
  ({
    component: css({
      backgroundColor: colorToCssRGB(brandColors.main.dark),
      position: "sticky",
      top: 0,
      fontSize: fontSize("l"),
      gap: spaceRem(),
      textTransform: "uppercase",
      nav: css({
        display: "flex",
        gap: spaceRem(),
      }),
      zIndex: 1,
    }),
  } as const);
