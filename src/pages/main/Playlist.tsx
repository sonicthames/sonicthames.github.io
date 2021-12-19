import { css } from "@emotion/css";
import { pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import { Sound } from "../../domain/base";
import { spacingRem } from "../../theme/spacing";

interface PlaylistItemProps {
  name: string;
  coordinates: { lat: number; lng: number };
}

export const PlaylistItem = ({ name, coordinates }: PlaylistItemProps) => {
  return (
    <li>
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
          console.log("Goto");
        }}
      >
        In map
      </button>
    </li>
  );
};

interface PlaylistProps {
  sounds: ReadonlyArray<Sound>;
}

export const Playlist = ({ sounds }: PlaylistProps): JSX.Element => {
  return (
    <div>
      <ul className={styles.list}>
        {pipe(
          sounds,
          RA.map(({ title, coordinates }) => (
            <PlaylistItem name={title} coordinates={coordinates} />
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
