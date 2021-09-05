import { Sound } from "./domain/base";

export const sounds: ReadonlyArray<Sound> = [
  {
    position: { lat: 10, lng: 20 },
    title: "New page",
    // Link to youtube
    videoSrc: "BHACKCNDMW8",
    description: [
      "Vivamus integer non suscipit.",
      "Mollis pretium lorem primis senectus habitasse lectus scelerisque donec.",
      "A new paragraph.",
    ],
    // Category = "Soundscapes" | "Sound Walks" | "Binaural Cycling" | "Sonic Sculptures"
    category: "Soundscapes",
    microphones: {
      binaural: {
        enabled: true,
        subcategories: ["In ear", "Dummy head (Leonardo)"],
      },
      contact: {
        enabled: true,
        subcategories: ["Single", "Stereo", "Multiple"],
      },
      shotgun: {
        enabled: true,
        subcategories: ["Mono", "Stereo"],
      },
      hydrophone: {
        enabled: true,
        subcategories: ["Mono", "Stereo"],
      },
      mobile_phone: {
        enabled: true,
        subcategories: ["Stereo"],
      },
      stereo_xy: {
        enabled: true,
      },
    },
  },
  {
    position: { lat: 10, lng: 20 },
    title: "New page 2",
    // Link to youtube
    videoSrc: "BHACKCNDMW8",
    description: ["Text for the new page"],
    // Category = "Soundscapes" | "Sound Walks" | "Binaural Cycling" | "Sonic Sculptures"
    category: "Soundscapes",
    microphones: {
      binaural: {
        enabled: true,
        subcategories: ["In ear", "Dummy head (Leonardo)"],
      },
      contact: {
        enabled: true,
        subcategories: ["Single", "Stereo", "Multiple"],
      },
      shotgun: {
        enabled: true,
        subcategories: ["Mono", "Stereo"],
      },
      hydrophone: {
        enabled: true,
        subcategories: ["Mono", "Stereo"],
      },
      mobile_phone: {
        enabled: true,
        subcategories: ["Stereo"],
      },
      stereo_xy: {
        enabled: true,
      },
    },
  },
  {
    position: { lat: 51.47, lng: 0.28 },
    title: "Amazing Nature Scenery",
    videoSrc: "BHACKCNDMW8",
    description: [
      "3 Hours of Amazing Nature Scenery & Relaxing Music for Stress Relief.",
    ],
    category: "Sonic Sculptures",
    microphones: {
      binaural: {
        subcategories: ["Dummy Head"],
        // description: "Binaural ",
      },
      contact: false,
    },
  },
  {
    position: { lat: 51.44, lng: 0.51 },
    title: "Earth from Above",
    videoSrc: "lM02vNMRRB0",
    description:
      'PELÍCULA DE 7 HORAS 4K DRONE: "Earth from Above" + Music by Nature Relaxation',
    category: "Sonic Sculptures",
  },
  {
    position: { lat: 51.44, lng: 0.51 },
    title: "Earth from Above",
    videoSrc: "lM02vNMRRB0",
    description:
      'PELÍCULA DE 7 HORAS 4K DRONE: "Earth from Above" + Music by Nature Relaxation',
    category: "Sonic Sculptures",
    microphones: {
      binaural: true,
    },
  },
  {
    position: { lat: 51.45, lng: 0.37 },
    title: "Norway 4K",
    videoSrc: "CxwJrzEdw1U",
    description: "Norway 4K - Scenic Relaxation Film with Calming Music",
    category: "Sonic Sculptures",
  },
  {
    position: { lat: 51.48, lng: 0.51 },
    title: "Italy 4K",
    videoSrc: "2b2gJu-g3qE",
    description: "Italy 4K - Scenic Relaxation Film With Calming Music",
    category: "Binaural Cycling",
    microphones: {
      binaural: true,
      contact: true,
    },
  },
  {
    position: { lat: 51.46, lng: 0.27 },
    title: "Norway 4K",
    videoSrc: "CxwJrzEdw1U",
    description: "Norway 4K - Scenic Relaxation Film with Calming Music",
    category: "Sound Walks",
    microphones: {
      binaural: true,
      contact: true,
    },
  },
  {
    position: { lat: 51.46, lng: 0.48 },
    title: "Wonderful movie soundtracks",
    videoSrc: "hqG8u0jsk1A",
    description: "",
    category: "Sound Walks",
  },
  {
    position: { lat: 51.47, lng: 0.49 },
    title: "Emotional Drama",
    videoSrc: "ht2ERtFfFPw",
    description: "Emotional and Relaxing Drama & Epic Film Music",
    category: "Soundscapes",
  },
];
