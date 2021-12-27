import { css } from "@emotion/css";
import { constNull, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { _useMapControl } from "react-map-gl";
import { H3 } from "../../components/Typography";
import {
  HasIntervalOption,
  showDateTime,
  showInterval,
  Sound,
} from "../../domain/base";
import { Icon } from "../../icon";
import { spacingEm, spacingRem } from "../../theme/spacing";
import { Subject } from "rxjs";

interface Props {
  sound: Sound;
  className?: string;
  close$: Subject<void>;
}

export const Hover = ({ sound, close$, ...props }: Props) => {
  const ref = _useMapControl({});

  const hasInterval = sound as HasIntervalOption;
  hasInterval.interval;

  return (
    <div ref={ref.containerRef} {...props} style={{ cursor: "initial" }}>
      <button onClick={() => close$.next()} className={styles.closeButton}>
        <Icon name="Close" width="2rem" height="2rem" />
      </button>
      <img
        title={sound.title}
        className={styles.image}
        src="/thumbnails/placeholder.jpeg"
      />
      <div className={styles.content}>
        <div className={styles.soundHeader}>
          <H3>{sound.title}</H3>
        </div>
        <div>
          {pipe(
            sound.description,
            RA.map((x) => <div>{x}</div>)
          )}
        </div>
        {"interval" in sound
          ? pipe(
              sound.interval,
              O.fold(constNull, (x) => (
                <div>
                  <label>
                    <strong>Interval: </strong>
                  </label>
                  <span>{showInterval(x)}</span>
                </div>
              ))
            )
          : pipe(
              sound.dateTime,
              O.fold(constNull, (x) => (
                <div>
                  <label>
                    <strong>Recorded date: </strong>
                  </label>
                  <span>{showDateTime(x)}</span>
                </div>
              ))
            )}
        {pipe(
          sound.location,
          O.fold(constNull, (location) => (
            <div>
              <label>
                <strong>Place: </strong>
              </label>
              <span>{location}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  soundHeader: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  image: css({
    width: "100%",
    height: 140,
    border: "none",
    boxSizing: "border-box",
  }),
  closeButton: css({
    position: "absolute",
    right: spacingEm("s"),
    top: spacingEm("s"),
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  }),
  content: css({
    padding: spacingRem("s"),
  }),
};
