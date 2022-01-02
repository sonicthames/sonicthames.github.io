import { css } from "@emotion/css";
import * as d3 from "d3-ease";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import { _useMapControl } from "react-map-gl";
import { Subject } from "rxjs";
import { Sound } from "../../domain/base";
import { Coordinate, GoTo } from "../../lib/map";
import { spacingRem } from "../../theme/spacing";

interface PlaylistItemProps {
  readonly name: string;
  readonly goTo$: Subject<GoTo>;
  readonly coordinates: Coordinate;
}

export const PlaylistItem = ({
  name,
  goTo$,
  coordinates,
}: PlaylistItemProps) => {
  const ref = _useMapControl({});

  return (
    <li className={styles.item} ref={ref.containerRef}>
      <button
        onClick={() => {
          console.log("Reproduce");
        }}
      >
        Play
      </button>
      <span className={styles.itemName}>{name}</span>
      <button
        onClick={() => {
          goTo$.next({
            ...coordinates,
            zoom: 14,
            transitionDuration: 500,
            transitionEasing: d3.easeCubic,
          });
        }}
      >
        In map
      </button>
    </li>
  );
};

interface PlaylistProps {
  readonly sounds: ReadonlyArray<Sound>;
  readonly goTo$: Subject<GoTo>;
}

export const Playlist = ({ sounds, goTo$ }: PlaylistProps): JSX.Element => {
  return (
    <div>
      <ul className={styles.list}>
        {pipe(
          sounds,
          RA.map(({ title, coordinates }) => (
            <PlaylistItem
              name={title}
              goTo$={goTo$}
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
    justifyContent: "space-between",
    gap: spacingRem("default"),
  }),
  itemName: css({
    flex: 1,
  }),
};
