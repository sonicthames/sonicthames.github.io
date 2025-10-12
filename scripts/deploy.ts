import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as D from "io-ts/Decoder";
import { loadEnv } from "vite";

const EnvDecoder = D.struct({
  VITE_MAPBOX_TOKEN: pipe(
    D.string,
    D.refine(
      (value): value is string => value.trim().length > 0,
      "VITE_MAPBOX_TOKEN must be defined"
    )
  ),
});

const root = process.cwd();
const loadedEnv = loadEnv("production", path.resolve(root), "");

const candidateEnv = {
  VITE_MAPBOX_TOKEN:
    process.env.VITE_MAPBOX_TOKEN ??
    loadedEnv.VITE_MAPBOX_TOKEN ??
    process.env.MAPBOX_TOKEN ??
    loadedEnv.MAPBOX_TOKEN ??
    process.env.MAPBOX_ACCESS_TOKEN ??
    loadedEnv.MAPBOX_ACCESS_TOKEN,
};

const decodedEnv = pipe(
  EnvDecoder.decode(candidateEnv),
  E.getOrElse((errors) => {
    throw new Error(
      [
        "Unable to deploy: missing required environment variables.",
        "",
        D.draw(errors),
        "",
        "Set VITE_MAPBOX_TOKEN (or MAPBOX_TOKEN / MAPBOX_ACCESS_TOKEN) locally or in your CI environment.",
      ].join("\n")
    );
  })
);

const run = (command: string) => {
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env, ...decodedEnv },
  });
};

try {
  process.env.VITE_MAPBOX_TOKEN = decodedEnv.VITE_MAPBOX_TOKEN;
  run("pnpm run build");
  run("pnpm exec gh-pages -d dist --dotfiles");
  console.info("Deployment completed successfully.");
} catch (error) {
  console.error("Deployment failed.");
  throw error;
}
