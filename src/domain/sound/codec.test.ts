import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import { DateTime, Duration, Interval } from "luxon"
import { describe, expect, it } from "vitest"
import { D_Category, D_Data, D_Sound } from "./codec"

describe("Sound Domain Codecs", () => {
  const _testDuration: Duration = Duration.fromObject({ minutes: 5 })
  const _testDateTime: DateTime = DateTime.fromISO("2023-06-15T14:30:00")
  const _testInterval: Interval = Interval.fromDateTimes(
    DateTime.fromISO("2023-06-15T14:00:00"),
    DateTime.fromISO("2023-06-15T15:00:00"),
  )

  describe("D_Category", () => {
    it("should decode valid categories", () => {
      expect(E.isRight(D_Category.decode("Listen"))).toBe(true)
      expect(E.isRight(D_Category.decode("See"))).toBe(true)
      expect(E.isRight(D_Category.decode("Feel"))).toBe(true)
    })

    it("should reject invalid categories", () => {
      expect(E.isLeft(D_Category.decode("Invalid"))).toBe(true)
      expect(E.isLeft(D_Category.decode("listen"))).toBe(true) // case-sensitive
    })
  })

  describe("D_Sound", () => {
    const validSoundWithInterval = {
      title: "Test Sound With Interval",
      description: ["A test", "description"],
      marker: "test-marker-interval",
      category: "See",
      playOnProximity: false,
      duration: "PT5M",
      location: "Test Location",
      access: "Public access",
      coordinate: { lat: 51.5, lng: -0.1 },
      videoSrc: "https://example.com/video.mp4",
      thumbnailSrc: "https://example.com/thumb.jpg",
      interval: "2023-06-15T14:00:00Z/2023-06-15T15:00:00Z",
    }

    const validSoundWithDateTime = {
      title: "Test Sound With DateTime",
      description: ["A test", "description"],
      marker: "test-marker-datetime",
      category: "Feel",
      playOnProximity: true,
      duration: "PT3M",
      location: null,
      access: "Restricted",
      coordinate: { lat: 51.4, lng: -0.2 },
      videoSrc: "https://example.com/video2.mp4",
      thumbnailSrc: null,
      dateTime: "2023-06-15T16:30:00Z",
    }

    it("should decode sound with interval", () => {
      const result = pipe(
        D_Sound.decode(validSoundWithInterval),
        E.map((sound) => ({
          title: sound.title,
          category: sound.category,
          playOnProximity: sound.playOnProximity,
          interval:
            "interval" in sound && sound.interval._tag === "Some"
              ? sound.interval.value
              : null,
          dateTime:
            "dateTime" in sound && sound.dateTime._tag === "Some"
              ? sound.dateTime.value
              : undefined,
        })),
      )

      expect(E.isRight(result)).toBe(true)
      if (E.isRight(result)) {
        expect(result.right.title).toBe("Test Sound With Interval")
        expect(result.right.category).toBe("See")
        expect(result.right.playOnProximity).toBe(false)
        expect(result.right.interval).toBeInstanceOf(Interval)
        expect(result.right.dateTime).toBeUndefined()
      }
    })

    it("should decode sound with datetime", () => {
      const result = pipe(
        D_Sound.decode(validSoundWithDateTime),
        E.map((sound) => ({
          title: sound.title,
          category: sound.category,
          playOnProximity: sound.playOnProximity,
          interval:
            "interval" in sound && sound.interval._tag === "Some"
              ? sound.interval.value
              : undefined,
          dateTime:
            "dateTime" in sound && sound.dateTime._tag === "Some"
              ? sound.dateTime.value
              : null,
        })),
      )

      expect(E.isRight(result)).toBe(true)
      if (E.isRight(result)) {
        expect(result.right.title).toBe("Test Sound With DateTime")
        expect(result.right.category).toBe("Feel")
        expect(result.right.playOnProximity).toBe(true)
        expect(result.right.interval).toBeUndefined()
        expect(result.right.dateTime).toBeInstanceOf(DateTime)
      }
    })

    it("should reject invalid sound", () => {
      const invalidSound = {
        ...validSoundWithInterval,
        category: "InvalidCategory",
      }

      expect(E.isLeft(D_Sound.decode(invalidSound))).toBe(true)
    })
  })

  describe("D_Data", () => {
    it("should decode array of sounds", () => {
      const validData = [
        {
          title: "Sound 1",
          description: ["Desc 1"],
          marker: "marker1",
          category: "Listen",
          playOnProximity: true,
          duration: "PT2M",
          location: "Loc 1",
          access: "Access 1",
          coordinate: { lat: 51.5, lng: -0.1 },
          videoSrc: "https://example.com/1.mp4",
          thumbnailSrc: "https://example.com/1.jpg",
          interval: "2023-06-15T14:00:00Z/2023-06-15T14:30:00Z",
        },
        {
          title: "Sound 2",
          description: ["Desc 2"],
          marker: "marker2",
          category: "See",
          playOnProximity: false,
          duration: "PT3M",
          location: null,
          access: null,
          coordinate: { lat: 51.4, lng: -0.2 },
          videoSrc: "https://example.com/2.mp4",
          thumbnailSrc: null,
          dateTime: "2023-06-15T16:30:00Z",
        },
      ]

      const result = pipe(
        D_Data.decode(validData),
        E.map((sounds) => sounds.length),
      )

      expect(E.isRight(result)).toBe(true)
      if (E.isRight(result)) {
        expect(result.right).toBe(2)
      }
    })

    it("should reject invalid data array", () => {
      const invalidData = [
        {
          title: "Valid Sound",
          description: ["Desc"],
          marker: "marker",
          category: "Listen",
          playOnProximity: true,
          duration: "PT2M",
          location: "Loc",
          access: "Access",
          coordinate: { lat: 51.5, lng: -0.1 },
          videoSrc: "https://example.com/vid.mp4",
          // Missing required thumbnailSrc
        },
      ]

      expect(E.isLeft(D_Data.decode(invalidData))).toBe(true)
    })
  })
})
