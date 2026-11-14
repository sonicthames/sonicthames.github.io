import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { z } from "zod"

const SITE_NAME = "Sonic Thames"

const SoundEntry = z.object({
  category: z.string(),
  title: z.string(),
  marker: z.string(),
  description: z.array(z.string()),
  videoSrc: z.string(),
})

type SoundEntry = z.infer<typeof SoundEntry>

interface RouteMeta {
  readonly path: string
  readonly title: string
  readonly description: string
  readonly image: string
  readonly largeImage: boolean
}

export interface RoutePage {
  readonly path: string
  readonly html: string
}

// Must match soundId in src/pages/location.ts; route-pages.test.ts checks it.
export const soundPath = (sound: Pick<SoundEntry, "marker">) =>
  `/sound/${sound.marker.toLowerCase().replaceAll(" ", "_")}`

const escapeAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

const readDescription = (indexHtml: string) => {
  const match = /<meta name="description" content="([^"]*)"/.exec(indexHtml)
  if (match?.[1] === undefined) {
    throw new Error("index.html has no meta description")
  }
  return match[1]
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
}

const withMeta = (indexHtml: string, base: string, meta: RouteMeta) => {
  const title = escapeAttribute(meta.title)
  const description = escapeAttribute(meta.description)
  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${base}${meta.path}" />`,
    `<meta property="og:image" content="${escapeAttribute(meta.image)}" />`,
    `<meta name="twitter:card" content="${meta.largeImage ? "summary_large_image" : "summary"}" />`,
  ].join("\n    ")
  return indexHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${description}"`,
    )
    .replace("</head>", `  ${tags}\n  </head>`)
}

export const buildRoutePages = (
  indexHtml: string,
  sounds: ReadonlyArray<SoundEntry>,
  base: string,
): ReadonlyArray<RoutePage> => {
  const description = readDescription(indexHtml)
  const logo = `${base}/logo512.png`
  const page = (path: string, title: string): RouteMeta => ({
    path,
    title,
    description,
    image: logo,
    largeImage: false,
  })
  const routes: ReadonlyArray<RouteMeta> = [
    page("/", SITE_NAME),
    page("/main", SITE_NAME),
    page("/about", `About · ${SITE_NAME}`),
    page("/contact", `Contact · ${SITE_NAME}`),
    page("/listen", `Listen · ${SITE_NAME}`),
    page("/see", `See · ${SITE_NAME}`),
    page("/feel", `Feel · ${SITE_NAME}`),
    ...sounds.map((sound) => ({
      path: soundPath(sound),
      title: `${sound.title} · ${SITE_NAME}`,
      description:
        sound.description.find((line) => line !== sound.title) ?? description,
      image: `https://i.ytimg.com/vi/${sound.videoSrc}/hqdefault.jpg`,
      largeImage: true,
    })),
  ]
  return routes.map((meta) => ({
    path: meta.path,
    html: withMeta(indexHtml, base, meta),
  }))
}

const main = () => {
  const root = path.resolve(import.meta.dirname, "..")
  const dist = path.join(root, "dist")
  const pkg = z
    .object({ homepage: z.string() })
    .parse(JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")))
  const sounds = z
    .array(SoundEntry)
    .parse(JSON.parse(readFileSync(path.join(root, "src/data.json"), "utf8")))
  const indexHtml = readFileSync(path.join(dist, "index.html"), "utf8")
  for (const { path: route, html } of buildRoutePages(
    indexHtml,
    sounds,
    pkg.homepage,
  )) {
    const directory = path.join(dist, route)
    mkdirSync(directory, { recursive: true })
    writeFileSync(path.join(directory, "index.html"), html)
  }
}

if (process.argv[1] === import.meta.filename) {
  main()
}
