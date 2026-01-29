import { build } from "esbuild";

const externals = ["@aws-sdk/credential-providers", "express"];

await build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  outfile: "./dist/index.js",
  minify: true,
  drop: ["console"],
  external: externals,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  tsconfig: "./tsconfig.json",
});
