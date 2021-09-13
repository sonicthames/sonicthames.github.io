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
      <div className={styles.content}>
        <nav>
          <Link component={RouterLink} to="/main">
            Home
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

export const PageHeader = () => {
  const deviceType = useDeviceType();
  const styles = makeStyles({ deviceType });
  return (
    <header className={styles.component}>
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
      backgroundColor: colorToCssRGBA([...brandColors.neve.primary, 0.7]),
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
