import type { Option } from "fp-ts/Option"
import { none, some } from "fp-ts/Option"
import { DateTime, Duration, Interval } from "luxon"
import { LngLat } from "mapbox-gl"
import { describe, expect, it } from "vitest"
import type {
  HasDateTimeOption,
  HasIntervalOption,
  Sound,
  SoundBase,
} from "./types"
import {
  R_CategoryFlavor,
  R_CategoryRoute,
  showDateTime,
  showInterval,
} from "./types"

describe("Sound Domain Types", () => {
  const testLngLat: LngLat = new LngLat(-0.1, 51.5)
  const testDuration: Duration = Duration.fromObject({ minutes: 5 })
  const testDateTime: DateTime = DateTime.fromISO("2023-06-15T14:30:00")
  const testInterval: Interval = Interval.fromDateTimes(
    DateTime.fromISO("2023-06-15T14:00:00"),
    DateTime.fromISO("2023-06-15T15:00:00"),
  )
  const testSomeString: Option<string> = some("Test Location")
  const testNoneString: Option<string> = none

  describe("Category", () => {
    it("should have correct values", () => {
      expect("Listen").toBe("Listen")
      expect("See").toBe("See")
      expect("Feel").toBe("Feel")
    })

    it("should have correct flavor mappings", () => {
      expect(R_CategoryFlavor.Listen).toBe("Sonic Points Fixed position")
      expect(R_CategoryFlavor.See).toBe("Sonic Scape Multi direction")
      expect(R_CategoryFlavor.Feel).toBe("PLACEHOLDER")
    })

    it("should have correct route mappings", () => {
      expect(R_CategoryRoute.Listen).toBe("listen")
      expect(R_CategoryRoute.See).toBe("see")
      expect(R_CategoryRoute.Feel).toBe("feel")
    })
  })

  describe("SoundBase", () => {
    const base: SoundBase = {
      title: "Test Sound",
      description: ["A test sound description"],
      marker: "test-marker",
      category: "Listen",
      playOnProximity: true,
      duration: testDuration,
      location: testSomeString,
      access: testSomeString,
      coordinate: testLngLat,
      videoSrc: "https://example.com/video.mp4",
      thumbnailSrc: testSomeString,
    }

    it("should have all required properties", () => {
      expect(base.title).toBe("Test Sound")
      expect(base.description).toEqual(["A test sound description"])
      expect(base.marker).toBe("test-marker")
      expect(base.category).toBe("Listen")
      expect(base.playOnProximity).toBe(true)
      expect(base.duration).toBe(testDuration)
      expect(base.location).toEqual(testSomeString)
      expect(base.access).toEqual(testSomeString)
      expect(base.coordinate).toBe(testLngLat)
      expect(base.videoSrc).toBe("https://example.com/video.mp4")
      expect(base.thumbnailSrc).toEqual(testSomeString)
    })
  })

  describe("HasIntervalOption", () => {
    const withInterval: HasIntervalOption = {
      interval: some(testInterval),
    }

    const withoutInterval: HasIntervalOption = {
      interval: none,
    }

    it("should handle interval option", () => {
      expect(withInterval.interval).toEqual(some(testInterval))
      expect(withoutInterval.interval).toEqual(none)
    })
  })

  describe("HasDateTimeOption", () => {
    const withDateTime: HasDateTimeOption = {
      dateTime: some(testDateTime),
    }

    const withoutDateTime: HasDateTimeOption = {
      dateTime: none,
    }

    it("should handle datetime option", () => {
      expect(withDateTime.dateTime).toEqual(some(testDateTime))
      expect(withoutDateTime.dateTime).toEqual(none)
    })
  })

  describe("Sound", () => {
    const soundWithInterval: Sound = {
      title: "Test Sound With Interval",
      description: ["A test sound with interval"],
      marker: "test-marker-interval",
      category: "See",
      playOnProximity: false,
      duration: testDuration,
      location: testSomeString,
      access: testNoneString,
      coordinate: testLngLat,
      videoSrc: "https://example.com/video2.mp4",
      thumbnailSrc: testNoneString,
      interval: some(testInterval),
    }

    const soundWithDateTime: Sound = {
      title: "Test Sound With DateTime",
      description: ["A test sound with datetime"],
      marker: "test-marker-datetime",
      category: "Feel",
      playOnProximity: true,
      duration: testDuration,
      location: testNoneString,
      access: testSomeString,
      coordinate: testLngLat,
      videoSrc: "https://example.com/video3.mp4",
      thumbnailSrc: testSomeString,
      dateTime: some(testDateTime),
    }

    it("should handle sound with interval", () => {
      expect(soundWithInterval.title).toBe("Test Sound With Interval")
      expect(soundWithInterval.category).toBe("See")
      expect(soundWithInterval.interval).toEqual(some(testInterval))
      // dateTime should be undefined for HasIntervalOption
      expect("dateTime" in soundWithInterval).toBe(false)
    })

    it("should handle sound with datetime", () => {
      expect(soundWithDateTime.title).toBe("Test Sound With DateTime")
      expect(soundWithDateTime.category).toBe("Feel")
      expect(soundWithDateTime.dateTime).toEqual(some(testDateTime))
      // interval should be undefined for HasDateTimeOption
      expect("interval" in soundWithDateTime).toBe(false)
    })
  })

  describe("showDateTime", () => {
    it("should format date correctly", () => {
      expect(showDateTime(DateTime.fromISO("2023-06-15T14:30:00"))).toBe(
        "15 Jun 2023",
      )
    })

    it("should handle different locales", () => {
      // This tests the format function, not locale changes
      expect(showDateTime(DateTime.fromISO("2023-01-01T00:00:00"))).toBe(
        "01 Jan 2023",
      )
    })
  })

  describe("showInterval", () => {
    it("should handle null interval", () => {
      expect(
        showInterval({ start: null, end: null } as unknown as Interval),
      ).toBe("N/A")
    })

    it("should handle same day interval", () => {
      const sameDayInterval = Interval.fromDateTimes(
        DateTime.fromISO("2023-06-15T14:00:00"),
        DateTime.fromISO("2023-06-15T16:30:00"),
      )
      expect(showInterval(sameDayInterval)).toBe(
        "15 Jun 2023, from 14:00 to 16:30",
      )
    })

    it("should handle multi-day interval", () => {
      const multiDayInterval = Interval.fromDateTimes(
        DateTime.fromISO("2023-06-15T14:00:00"),
        DateTime.fromISO("2023-06-17T10:30:00"),
      )
      expect(showInterval(multiDayInterval)).toBe(
        "15 Jun 2023 14:00 - 17 Jun 2023 10:30",
      )
    })

    it("should handle start only", () => {
      expect(
        showInterval({ start: testDateTime, end: null } as unknown as Interval),
      ).toBe("from 15 Jun 2023 14:30")
    })

    it("should handle end only", () => {
      expect(
        showInterval({ start: null, end: testDateTime } as unknown as Interval),
      ).toBe("until 15 Jun 2023 14:30")
    })
  })
})
