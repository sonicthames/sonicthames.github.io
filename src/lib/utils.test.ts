import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn utility", () => {
  it("should join class names correctly", () => {
    expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3")
  })

  it("should handle falsy values correctly", () => {
    expect(cn("class1", false, "class2", 0, "class3")).toBe(
      "class1 class2 class3",
    )
  })

  it("should handle null and undefined values", () => {
    expect(cn("class1", null, "class2", undefined, "class3")).toBe(
      "class1 class2 class3",
    )
  })

  it("should work with ClassValue objects", () => {
    // This tests the integration with clsx
    expect(cn("base", { active: true, disabled: false }, "hidden")).toBe(
      "base active hidden",
    )
  })

  it("should return empty string when no classes provided", () => {
    expect(cn()).toBe("")
  })

  it("should handle duplicate classes", () => {
    expect(cn("class1", "class1", "class2")).toBe("class1 class1 class2")
  })
})
