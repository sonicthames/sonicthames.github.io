import rawData from "../src/data.json" with { type: "json" }
import { D_Data } from "../src/domain/sound/index.ts"
import { appRoute, soundId } from "../src/pages/location.ts"
import { buildRoutePages, soundPath } from "./route-pages.ts"

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta name="description" content="A map &amp; more" />
    <title>Sonic Thames</title>
  </head>
  <body></body>
</html>`

const sounds = rawData as ReadonlyArray<{
  readonly category: string
  readonly title: string
  readonly marker: string
  readonly description: string[]
  readonly videoSrc: string
}>

const pages = buildRoutePages(indexHtml, sounds, "https://example.test")
const pageAt = (path: string) => {
  const found = pages.find((p) => p.path === path)
  if (found === undefined) throw new Error(`no page for ${path}`)
  return found.html
}

describe("route pages", () => {
  it("writes a page for every app route and every sound", () => {
    const decoded = D_Data.decode(rawData)
    if (decoded._tag === "Left") throw new Error("data.json does not decode")
    const expected = [
      appRoute("main").to({}).path,
      appRoute("about").to({}).path,
      appRoute("contact").to({}).path,
      appRoute("listen").to({}).path,
      appRoute("see").to({}).path,
      appRoute("feel").to({}).path,
      ...decoded.right.map((sound) => `/sound/${soundId(sound)}`),
    ]
    expect(pages.map((p) => p.path)).toEqual(expect.arrayContaining(expected))
    for (const sound of decoded.right) {
      expect(soundPath(sound)).toBe(`/sound/${soundId(sound)}`)
    }
  })

  it("titles and describes a sound page for link previews", () => {
    const html = pageAt("/sound/jetty")
    expect(html).toContain("<title>Wooden Jetty · Sonic Thames</title>")
    expect(html).toContain(
      '<meta property="og:url" content="https://example.test/sound/jetty" />',
    )
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image" />',
    )
    expect(html).toMatch(
      /og:image" content="https:\/\/i\.ytimg\.com\/vi\/[^/]+\/hqdefault\.jpg"/,
    )
  })

  it("falls back to the site description and escapes it", () => {
    const html = pageAt("/about")
    expect(html).toContain("<title>About · Sonic Thames</title>")
    expect(html).toContain(
      '<meta property="og:description" content="A map &amp; more" />',
    )
  })
})
