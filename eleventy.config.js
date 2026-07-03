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

  // Given a collection and the current page URL, return the next item,
  // wrapping around to the first so the "next work" link always has somewhere
  // to go. Returns null if the URL isn't in the collection (or it's empty).
  eleventyConfig.addFilter("nextInCollection", (collection, url) => {
    if (!collection || collection.length === 0) return null;
    const i = collection.findIndex((item) => item.url === url);
    if (i === -1) return null;
    return collection[(i + 1) % collection.length];
  });

  // Format a Date as "Month YYYY" for post eyebrows and datelines.
  eleventyConfig.addFilter("monthYear", (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  });

  // Machine-readable YYYY-MM-DD for <time datetime="…"> attributes.
  eleventyConfig.addFilter("htmlDateString", (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  });

  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

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
