import * as O from "fp-ts/Option";
import type { DateTime, Duration, Interval } from "luxon";

export type Category =
  | "Soundscapes"
  | "Sound Walks"
  | "Binaural Cycling"
  | "Sonic Sculptures";

export type Microphone =
  | "binaural"
  | "hydrophone"
  | "shotgun"
  | "contact"
  | "mobile_phone"
  | "stereo_xy";

export const micDescriptions: Record<Microphone, string> = {
  binaural: "",
  hydrophone: "",
  shotgun: "",
  contact: "",
  mobile_phone: "",
  stereo_xy: "",
};

export interface Sound {
  position: { lat: number; lng: number };
  title: string;
  // REVIEW: Could have multiple types
  videoSrc: string;
  videoType?: string;
  description: string | ReadonlyArray<string>;
  category: Category;
  microphones?: Partial<
    Record<
      Microphone,
      | false
      | true
      | {
          enabled?: boolean;
          subcategories?: string | ReadonlyArray<string>;
        }
    >
  >;
  thumbnailSrc: string;
  date: Date; // Date;
  price: number; // Should be money
  format: string;
  length: number;
}
export type NewCategory = "Listen" | "See" | "Feel";

export interface SoundBase {
  title: string;
  description: readonly string[];
  marker: string;
  category: NewCategory;
  duration: Duration;
  location: O.Option<string>;
  access: O.Option<string>;
  coordinates: {
    lat: number;
    lng: number;
  };
  videoSrc: string;
}

export interface HasIntervalOption {
  interval: O.Option<Interval>;
}

export interface HasDateTimeOption {
  dateTime: O.Option<DateTime>;
}

export type NewSound = SoundBase & (HasIntervalOption | HasDateTimeOption);

export const R_CategoryFlavor: Readonly<Record<NewCategory, string>> = {
  Listen: "Sonic Points Fixed position",
  See: "Sonic Scape Multi direction",
  Feel: "PLACEHOLDER",
};

export const R_CategoryRoute = {
  Listen: "listen",
  See: "see",
  Feel: "feel",
} as const;
