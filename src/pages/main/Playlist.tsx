import { css, cx } from "@emotion/css";
import { IconButton } from "@material-ui/core";
import * as MUIIcon from "@mui/icons-material";
import * as d3 from "d3-ease";
import { constFalse, pipe } from "fp-ts/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { _useMapControl } from "react-map-gl";
import { Subject } from "rxjs";
import { Sound } from "../../domain/base";

import { Icon } from "../../icon";
import { Coordinate, GoTo } from "../../lib/map";
import { spacingRem } from "../../theme/spacing";

interface PlaylistItemProps {
  readonly name: string;
  readonly goTo$: Subject<GoTo>;
  readonly focused: boolean;
  readonly play$: Subject<string>;
  readonly coordinates: Coordinate;
}

export const PlaylistItem = ({
  name,
  goTo$,
  play$,
  coordinates,
  focused = false,
}: PlaylistItemProps) => {
  const ref = _useMapControl({});

  return (
    <li
      className={cx(
        styles.item,
        focused
          ? css({
              backgroundColor: "rgba(0, 0, 0, 0.08)",
            })
          : ""
      )}
      ref={ref.containerRef}
    >
      <IconButton size="small" onClick={() => play$.next(name)} title="play">
        <Icon name="Play" />
      </IconButton>
      <span className={styles.itemName}>{name}</span>
      <IconButton
        size="small"
        onClick={() =>
          goTo$.next({
            ...coordinates,
            zoom: 14,
            transitionDuration: 500,
            transitionEasing: d3.easeCubic,
          })
        }
        title="find in map"
      >
        <MUIIcon.GpsFixed />
      </IconButton>
    </li>
  );
};

interface PlaylistProps {
  readonly sounds: ReadonlyArray<Sound>;
  readonly play$: Subject<string>;
  readonly soundO: O.Option<Sound>;
  readonly goTo$: Subject<GoTo>;
}

export const Playlist = ({
  goTo$,
  play$,
  soundO,
  sounds,
}: PlaylistProps): JSX.Element => {
  return (
    <div>
      <ul className={styles.list}>
        {pipe(
          sounds,
          RA.map(({ title, coordinates }) => (
            <PlaylistItem
              goTo$={goTo$}
              focused={pipe(
                soundO,
                O.fold(constFalse, (s) => s.title === title)
              )}
              name={title}
              play$={play$}
              // TODO Rename lat lng
              coordinates={{
                latitude: coordinates.lat,
                longitude: coordinates.lng,
              }}
            />
          ))
        )}
      </ul>
    </div>
  );
};

const styles = {
  list: css({
    listStyle: "none",
    padding: 0,
    gap: spacingRem("xs"),
    display: "flex",
    flexDirection: "column",
  }),
  item: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacingRem("default"),
  }),
  itemName: css({
    flex: 1,
  }),
};
