import React from "react";
import { useDeviceType } from "../../theme/media";
import { makeCommonStyles } from "../styles";

interface Props {}

/**
 */
export const MainPage = (_: Props) => {
  const deviceType = useDeviceType();
  const commonStyles = makeCommonStyles(deviceType);
  return (
    <div className={commonStyles.page}>
      <main />
    </div>
  );
};
