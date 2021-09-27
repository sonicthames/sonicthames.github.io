import { createTheme } from "@material-ui/core/styles";
import { pipe } from "fp-ts/lib/function";
import * as RR from "fp-ts/ReadonlyRecord";
import { brandColors, colorToCssRGB } from "./colors";

export const theme = createTheme({
  palette: {
    primary: {
      ...pipe(brandColors.action, RR.map(colorToCssRGB)),
      contrastText: "#fff",
    },
    secondary: { ...brandColors.main, contrastText: "#fff" },
  },
});
