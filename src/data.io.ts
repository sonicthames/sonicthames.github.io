import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as DIO from "io-ts/Decoder";
import { DateTime, Duration, Interval } from "luxon";
import { SoundBase } from "./domain/base";

export const D_Category = DIO.union(
  DIO.literal("Listen"),
  DIO.literal("See"),
  DIO.literal("Feel")
);
// <NewSound>
export const D_Sound = pipe(
  DIO.struct<SoundBase>({
    title: DIO.string,
    description: DIO.readonly(DIO.array(DIO.string)),
    marker: DIO.string,
    category: D_Category,
    duration: pipe(
      DIO.string,
      DIO.parse(
        flow(
          Duration.fromISO,
          E.fromPredicate(
            (d) => d.invalidReason === null,
            (d) =>
              DIO.error(
                d,
                JSON.stringify(
                  `Duration:fromISO - ${d.invalidReason} - ${d.invalidExplanation}`
                )
              )
          )
        )
      )
    ),
    location: pipe(DIO.string, DIO.nullable, DIO.map(O.fromNullable)),
    access: pipe(DIO.string, DIO.nullable, DIO.map(O.fromNullable)),
    coordinates: DIO.struct({
      lat: DIO.number,
      lng: DIO.number,
    }),
    videoSrc: DIO.string,
    thumbnailSrc: pipe(DIO.string, DIO.nullable, DIO.map(O.fromNullable)),
  }),
  DIO.intersect(
    DIO.union(
      DIO.struct({
        dateTime: pipe(
          DIO.string,
          DIO.nullable,
          DIO.parse(
            flow(
              O.fromNullable,
              O.map(
                flow(
                  DateTime.fromISO,
                  E.fromPredicate(
                    (d) => d.invalidReason === null,
                    (d) =>
                      DIO.error(
                        d,
                        JSON.stringify(
                          `DateTime:fromISO - ${d.invalidReason} - ${d.invalidExplanation}`
                        )
                      )
                  )
                )
              ),
              O.sequence(E.Applicative)
            )
          )
        ),
      }),
      DIO.struct({
        interval: pipe(
          DIO.string,
          DIO.nullable,
          DIO.parse(
            flow(
              O.fromNullable,
              O.map(
                flow(
                  Interval.fromISO,
                  E.fromPredicate(
                    (d) => d.invalidReason === null,
                    (d) =>
                      DIO.error(
                        d,
                        JSON.stringify(
                          `Interval:fromISO - ${d.invalidReason} - ${d.invalidExplanation}`
                        )
                      )
                  )
                )
              ),
              O.sequence(E.Applicative)
            )
          )
        ),
      })
    )
  )
);
export const D_Data = DIO.readonly(DIO.array(DIO.readonly(D_Sound)));

// const latitude = 51.501;
// const longitude = -0.001;

// export const sounds: ReadonlyArray<Sound> = [
//   {
//     position: getRandomPosition(),
//     title: "New page",
//     // Link to youtube
//     videoSrc: "BHACKCNDMW8",
//     description: [
//       "Vivamus integer non suscipit.",
//       "Mollis pretium lorem primis senectus habitasse lectus scelerisque donec.",
//       "A new paragraph.",
//     ],
//     // Category = "Soundscapes" | "Sound Walks" | "Binaural Cycling" | "Sonic Sculptures"
//     category: "Soundscapes",
//     microphones: {
//       binaural: {
//         enabled: true,
//         subcategories: ["In ear", "Dummy head (Leonardo)"],
//       },
//       contact: {
//         enabled: true,
//         subcategories: ["Single", "Stereo", "Multiple"],
//       },
//       shotgun: {
//         enabled: true,
//         subcategories: ["Mono", "Stereo"],
//       },
//       hydrophone: {
//         enabled: true,
//         subcategories: ["Mono", "Stereo"],
//       },
//       mobile_phone: {
//         enabled: true,
//         subcategories: ["Stereo"],
//       },
//       stereo_xy: {
//         enabled: true,
//       },
//     },
//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: getRandomPosition(),
//     title: "New page 2",
//     // Link to youtube
//     videoSrc: "BHACKCNDMW8",
//     description: ["Text for the new page"],
//     // Category = "Soundscapes" | "Sound Walks" | "Binaural Cycling" | "Sonic Sculptures"
//     category: "Soundscapes",
//     microphones: {
//       binaural: {
//         enabled: true,
//         subcategories: ["In ear", "Dummy head (Leonardo)"],
//       },
//       contact: {
//         enabled: true,
//         subcategories: ["Single", "Stereo", "Multiple"],
//       },
//       shotgun: {
//         enabled: true,
//         subcategories: ["Mono", "Stereo"],
//       },
//       hydrophone: {
//         enabled: true,
//         subcategories: ["Mono", "Stereo"],
//       },
//       mobile_phone: {
//         enabled: true,
//         subcategories: ["Stereo"],
//       },
//       stereo_xy: {
//         enabled: true,
//       },
//     },

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },

//   {
//     position: { lat: 51.47, lng: 0.28 },
//     title: "Amazing Nature Scenery",
//     videoSrc: "BHACKCNDMW8",
//     description: [
//       "3 Hours of Amazing Nature Scenery & Relaxing Music for Stress Relief.",
//     ],
//     category: "Sonic Sculptures",
//     microphones: {
//       binaural: {
//         subcategories: ["Dummy Head"],
//         // description: "Binaural ",
//       },
//       contact: false,
//     },

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: { lat: 51.44, lng: 0.51 },
//     title: "Earth from Above",
//     videoSrc: "lM02vNMRRB0",
//     description:
//       'PELÍCULA DE 7 HORAS 4K DRONE: "Earth from Above" + Music by Nature Relaxation',
//     category: "Sonic Sculptures",

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: getRandomPosition(),
//     title: "Earth from Above",
//     videoSrc: "lM02vNMRRB0",
//     description:
//       'PELÍCULA DE 7 HORAS 4K DRONE: "Earth from Above" + Music by Nature Relaxation',
//     category: "Sonic Sculptures",
//     microphones: {
//       binaural: true,
//     },

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: { lat: 51.45, lng: 0.37 },
//     title: "Norway 4K",
//     videoSrc: "CxwJrzEdw1U",
//     description: "Norway 4K - Scenic Relaxation Film with Calming Music",
//     category: "Sonic Sculptures",

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: getRandomPosition(),
//     title: "Italy 4K",
//     videoSrc: "2b2gJu-g3qE",
//     description: "Italy 4K - Scenic Relaxation Film With Calming Music",
//     category: "Binaural Cycling",
//     microphones: {
//       binaural: true,
//       contact: true,
//     },

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: { lat: 51.46, lng: 0.27 },
//     title: "Norway 4K",
//     videoSrc: "CxwJrzEdw1U",
//     description: "Norway 4K - Scenic Relaxation Film with Calming Music",
//     category: "Sound Walks",
//     microphones: {
//       binaural: true,
//       contact: true,
//     },
//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: getRandomPosition(),
//     title: "Wonderful movie soundtracks",
//     videoSrc: "hqG8u0jsk1A",
//     description: [""],
//     category: "Sound Walks",

//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
//   {
//     position: getRandomPosition(),
//     title: "Emotional Drama",
//     videoSrc: "ht2ERtFfFPw",
//     description: "Emotional and Relaxing Drama & Epic Film Music",
//     category: "Soundscapes",
//     thumbnailSrc: "/thumbnails/placeholder.jpeg",
//     date: new Date(),
//     price: 10,
//     format: "Format",
//     length: 10,
//   },
// ];
