import * as sass from "sass";
import * as esbuild from "esbuild";
import fs from "node:fs";

export default function (eleventyConfig) {
  const buildDir = "src/_includes/build";

  eleventyConfig.on("eleventy.before", async () => {
    fs.mkdirSync(buildDir, { recursive: true });

    let cssResult = sass.compile("src/css/main.scss");
    fs.writeFileSync(`${buildDir}/main.css`, cssResult.css);

    let tsContent = fs.readFileSync("src/js/main.ts", "utf8");
    let jsResult = await esbuild.transform(tsContent, {
      loader: "ts",
      target: "es2020",
    });
    fs.writeFileSync(`${buildDir}/main.js`, jsResult.code);
  });

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  eleventyConfig.setServerOptions({
    host: "0.0.0.0",
  });

  eleventyConfig.setChokidarConfig({
    usePolling: true,
    interval: 500,
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
}
