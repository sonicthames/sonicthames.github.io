import { createTheme } from "@material-ui/core/styles";
import { brandColors } from "./colors";

export const theme = createTheme({
  palette: {
    primary: brandColors.action,
  },
});
