import { css, cx } from "@emotion/css";
import { Link } from "@material-ui/core";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { brandColors, colorToCssRGBA } from "../../theme/colors";
import { DeviceType } from "../../theme/device";
import { fontSize } from "../../theme/fontSize";
import { useDeviceType } from "../../theme/media";
import { maxPageSize, spaceRem } from "../../theme/spacing";

export const Header = () => {
  const deviceType = useDeviceType();
  const styles = makeStyles({ deviceType });
  return (
    <header className={styles.component}>
      <div
        className={cx(
          styles.content,
          // HACK
          css({
            a: css({
              color: "white",
              fontWeight: "bold",
            }),
          })
        )}
      >
        <nav>
          <Link color="textSecondary" component={RouterLink} to="/main">
            Home
          </Link>
          <Link color="textSecondary" component={RouterLink} to="/works">
            Sounds
          </Link>
          <Link color="textSecondary" component={RouterLink} to="/about">
            About
          </Link>
          <Link color="textSecondary" component={RouterLink} to="/contact">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export const PageHeader = () => {
  const deviceType = useDeviceType();
  const styles = makeStyles({ deviceType });
  return (
    <header className={styles.pageComponent}>
      <div className={styles.content}>
        <strong>Sonicthames</strong>
        <nav>
          <Link component={RouterLink} to="/main">
            Back to map
          </Link>
          <Link component={RouterLink} to="/works">
            Sounds
          </Link>
          <Link component={RouterLink} to="/about">
            About
          </Link>
          <Link component={RouterLink} to="/contact">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

const makeStyles = ({ deviceType }: { deviceType: DeviceType }) =>
  ({
    component: css({
      position: "sticky",
      top: 0,
      // backgroundColor: brandColors.neutral.main,
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2))",
      // backgroundColor: colorToCssRGBA([...brandColors.neutral.main, 0.7]),
      fontSize: fontSize("l"),
      gap: spaceRem(),
      textTransform: "uppercase",
      nav: css({
        display: "flex",
        gap: spaceRem(),
      }),
      zIndex: 1,
    }),
    pageComponent: css({
      position: "sticky",
      top: 0,
      backgorundColor: "lightgray",
      fontSize: fontSize("l"),
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
        display: "flex",
        justifyContent: "flex-end",
        gap: spaceRem(),
        paddingBottom: spaceRem(),
        paddingTop: spaceRem(),
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
