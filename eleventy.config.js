import * as sass from "sass";
import * as esbuild from "esbuild";
import yaml from "js-yaml";
import { marked } from "marked";
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

  eleventyConfig.addFilter("renderBody", (body, format) => {
    if (!body) return "";
    if (format === "html") return body;
    const hasMarkdown = /(?:^#{1,6}\s|^\s*[-*+]\s|\*\*.+\*\*|`.+`|^\s*>\s|```|\[.+\]\(.+\))/m.test(body);
    return hasMarkdown ? marked.parse(body) : body;
  });

  eleventyConfig.addTemplateFormats("yaml");

  eleventyConfig.addExtension("yaml", {
    read: true,
    getData(inputPath) {
      const content = fs.readFileSync(inputPath, "utf8");
      return yaml.load(content) || {};
    },
    compile(inputContent) {
      return async () => "";
    },
  });

  eleventyConfig.ignores.add("src/modules/");

  eleventyConfig.amendLibrary("njk", (env) => {
    env.loaders[0].searchPaths.push("src");
  });

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");
  eleventyConfig.addWatchTarget("src/modules/");

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
