import { css } from "@emotion/css";
import * as d3 from "d3-ease";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import { _useMapControl } from "react-map-gl";
import { Subject } from "rxjs";
import { Sound } from "../../domain/base";
import { Coordinate, GoTo } from "../../lib/map";

interface PlaylistItemProps {
  name: string;
  goTo$: Subject<GoTo>;
  coordinates: Coordinate;
}

export const PlaylistItem = ({
  name,
  goTo$,
  coordinates,
}: PlaylistItemProps) => {
  const ref = _useMapControl({});

  return (
    <li ref={ref.containerRef}>
      <button
        onClick={() => {
          console.log("Reproduce");
        }}
      >
        Play
      </button>
      {name}
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
  sounds: ReadonlyArray<Sound>;
  goTo$: Subject<GoTo>;
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
  }),
};
