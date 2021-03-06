import { css, cx } from "@emotion/css";
import { constNull, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { _useMapControl } from "react-map-gl";
import { Subject } from "rxjs";
import { H3 } from "../../components/Typography";
import { showDateTime, showInterval, Sound } from "../../domain/base";
import { Icon } from "../../icon";
import { controlIconSize, spacingEm, spacingRem } from "../../theme/spacing";

interface Props {
  readonly sound: Sound;
  readonly className?: string;
  readonly close$: Subject<void>;
}

export const Hover = ({ sound, close$, className }: Props) => {
  const ref = _useMapControl({
    captureDrag: true,
    capturePointerMove: true,
    captureClick: true,
    captureDoubleClick: true,
    captureScroll: true,
  });

  return (
    <div ref={ref.containerRef} className={cx(styles.component, className)}>
      <button onClick={() => close$.next()} className={styles.closeButton}>
        <Icon name="Close" width={controlIconSize} height={controlIconSize} />
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
            RA.map((x) => <div key={x}>{x}</div>)
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
  component: css({
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  }),
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
