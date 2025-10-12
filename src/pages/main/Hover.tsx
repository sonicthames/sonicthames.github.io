import { css, cx } from "@emotion/css";
import { IconButton } from "@material-ui/core";
import { Button } from "@mui/material";
import { constNull, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import { _useMapControl } from "react-map-gl";
import type { Subject } from "rxjs";
import { H3 } from "../../components/Typography";
import { showDateTime, showInterval, type Sound } from "../../domain/base";
import { Icon } from "../../icon";
import { controlIconSize, spacingRem } from "../../theme/spacing";

interface Props {
  readonly sound: Sound;
  readonly className?: string;
  readonly close$: Subject<void>;
  readonly play$: Subject<string>;
}

export const Hover = ({ sound, close$, play$, className }: Props) => {
  const ref = _useMapControl({
    captureDrag: true,
    capturePointerMove: true,
    captureClick: true,
    captureDoubleClick: true,
    captureScroll: true,
  });

  return (
    <div ref={ref.containerRef} className={cx(styles.component, className)}>
      <header
        className={css({
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          padding: spacingRem("xxs"),
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        })}
      >
        <IconButton onClick={() => close$.next()}>
          <Icon name="Close" width={controlIconSize} height={controlIconSize} />
        </IconButton>
      </header>
      <img
        alt={`${sound.title} thumbnail`}
        title={sound.title}
        className={styles.image}
        src="/thumbnails/placeholder.jpeg"
      />
      <div className={styles.content}>
        <header>
          <Button
            sx={{ justifyContent: "start" }}
            fullWidth
            variant="text"
            size="small"
            endIcon={
              <Icon
                name="Play"
                width={controlIconSize}
                height={controlIconSize}
              />
            }
            onClick={() => play$.next(sound.title)}
          >
            <H3>{sound.title}</H3>
          </Button>
        </header>
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
                  <strong>Interval: </strong>
                  <span>{showInterval(x)}</span>
                </div>
              ))
            )
          : pipe(
              sound.dateTime,
              O.fold(constNull, (x) => (
                <div>
                  <strong>Recorded date: </strong>
                  <span>{showDateTime(x)}</span>
                </div>
              ))
            )}
        {pipe(
          sound.location,
          O.fold(constNull, (location) => (
            <div>
              <strong>Place: </strong>
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
    cursor: "initial",
  }),
  image: css({
    width: "100%",
    height: 140,
    border: "none",
    boxSizing: "border-box",
  }),
  content: css({
    display: "flex",
    flexDirection: "column",
    gap: spacingRem("xxs"),
    padding: spacingRem("s"),
  }),
};
