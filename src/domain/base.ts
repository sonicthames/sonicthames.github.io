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

export interface NewSound {
  title: string;
  description: string;
  marker: string;
  category: NewCategory;
  duration: string;
  location: string;
  access: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  time: string;
  date: string;
  videoSrc: string;
}

export const R_ByCategory: Readonly<Record<NewCategory, string>> = {
  Listen: "Sonic Points Fixed position",
  See: "Sonic Scape Multi direction",
  Feel: "PLACEHOLDER",
};

export const R_CategoryRoute = {
  Listen: "listen",
  See: "see",
  Feel: "feel",
} as const;
