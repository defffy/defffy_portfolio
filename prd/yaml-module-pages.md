# YAML-Driven Modular Pages

## Problem Statement

The site currently uses Nunjucks templates (`.njk`) for pages, with content and markup tightly coupled in each file. This makes it difficult for content editors to add or reorder page sections without touching template code. There is no standardized, reusable set of page components — every page is a one-off arrangement of HTML. As the site grows, this approach leads to inconsistent markup, duplicated effort, and a high barrier to creating new pages.

## Solution

Replace Nunjucks page files with YAML data files that declaratively describe each page as an ordered list of typed modules. A shared Nunjucks layout reads the YAML, loops through the module list, and renders the corresponding partial for each entry. This separates content (YAML) from presentation (Nunjucks partials + SCSS), making it easy to build and rearrange pages by editing a single YAML file.

Three module types ship initially — **hero**, **text**, and **split** — each backed by its own Nunjucks partial and SCSS file. All modules support an optional CTA (call-to-action) block.

## User Stories

1. As a content author, I want to define a page's sections in a YAML file, so that I can build pages without writing HTML or template code.
2. As a content author, I want to add a hero section to any page by adding a `hero` entry to the YAML modules list, so that I can create impactful page headers quickly.
3. As a content author, I want to add a text block module with a body field, so that I can insert long-form content into any page.
4. As a content author, I want to write the text module body in Markdown, so that I can format content without writing raw HTML.
5. As a content author, I want the text module to auto-detect whether the body is Markdown or plain HTML, so that I don't need to specify the format every time.
6. As a content author, I want to opt out of Markdown rendering on a per-module basis with a flag, so that I can use raw HTML when auto-detection gets it wrong.
7. As a content author, I want to add a split module with text on one side and an image on the other, so that I can create visually balanced sections.
8. As a content author, I want the split module image to default to the right side, so that I don't have to specify position every time.
9. As a content author, I want to override the split module image position to `left`, so that I can vary the layout between sections.
10. As a content author, I want to attach an optional CTA (button with text and URL) to any module type, so that I can add calls-to-action wherever they make sense.
11. As a content author, I want to reorder modules in the YAML file, so that I can rearrange page sections without touching template code.
12. As a content author, I want to add or remove modules from the YAML list, so that I can change what appears on a page without modifying layouts or partials.
13. As a content author, I want to create a new page by adding a new YAML file, so that I can spin up pages quickly using the existing module set.
14. As a developer, I want each module type to have its own Nunjucks partial, so that I can modify one module's markup without affecting others.
15. As a developer, I want each module type to have its own SCSS partial, so that styles are scoped and maintainable per module.
16. As a developer, I want a single intermediate layout (`page.njk`) that handles the module loop, so that module rendering logic lives in one place.
17. As a developer, I want the module loop to gracefully skip unknown module types, so that a typo in YAML doesn't break the entire page.
18. As a developer, I want module partials to live in `src/modules/`, separate from layouts in `_includes/`, so that the project structure clearly separates content modules from page scaffolding.
19. As a developer, I want Eleventy to ignore `src/modules/` as page input, so that partials are not rendered as standalone pages.
20. As a content author, I want the hero module to support an optional background image, headline, and subtext, so that I can configure hero sections to fit the page's needs.
21. As a content author, I want all fields on every module to be optional (except `type`), so that I can use only the fields I need without errors.

## Implementation Decisions

- **Page format**: Pages are YAML files (e.g., `src/index.yaml`) using Eleventy's directory data file approach. The YAML file provides front matter data — including `layout`, `title`, and a `modules` list — which Eleventy feeds into the specified layout for rendering.
- **Layout chain**: A new `page.njk` layout extends `base.njk`. All YAML pages set `layout: page.njk`. `base.njk` remains the HTML shell (doctype, head, scripts). `page.njk` handles looping through `modules` and including the correct partial for each entry.
- **Module partials location**: Partials live in `src/modules/` (e.g., `src/modules/hero.njk`, `src/modules/text.njk`, `src/modules/split.njk`). Eleventy must be configured so these files are not treated as standalone pages — either via `.eleventyignore`, `eleventyConfig.ignores`, or permalink/output suppression. The Nunjucks environment must be configured with `src/modules/` as an additional include path so the partials can be resolved by the `{% include %}` tag.
- **Module loop**: `page.njk` iterates over the `modules` array. For each item, it includes the partial matching `item.type` (e.g., `{% include "modules/" + module.type + ".njk" %}`). Unknown types are skipped silently.
- **Module YAML schema**:
  ```yaml
  modules:
    - type: hero
      headline: "string"
      subtext: "string"
      background_image: "path"
      cta:
        text: "string"
        url: "string"
    - type: text
      body: "string (Markdown or HTML, auto-detected)"
      format: "html"  # optional opt-out flag, omit for auto-detect
      cta:
        text: "string"
        url: "string"
    - type: split
      heading: "string"
      body: "string"
      image: "path"
      image_position: "left | right"  # defaults to "right"
      cta:
        text: "string"
        url: "string"
  ```
- **Markdown handling**: A Nunjucks filter or macro detects whether the `body` field contains Markdown and renders it accordingly. If the module sets `format: "html"`, Markdown processing is skipped. Auto-detection can use simple heuristics (e.g., presence of Markdown-specific syntax like `#`, `**`, `- `, etc.) or default to treating content as Markdown unless opted out.
- **SCSS structure**: Each module gets its own SCSS partial in `src/css/modules/` (e.g., `_hero.scss`, `_text.scss`, `_split.scss`). These are imported into `main.scss`. Styles are minimal/structural initially — detailed visual design is out of scope.
- **CTA pattern**: A shared CTA partial or macro is used across all modules to avoid duplicating button markup. Each module's partial includes the CTA block conditionally when `module.cta` is present.
- **Removing the old page**: `src/index.njk` is deleted and replaced with `src/index.yaml`.

## Out of Scope

- Detailed visual design or polished styling — module SCSS will be structural/minimal.
- Image optimization, responsive images, or asset pipeline work.
- Additional module types beyond hero, text, and split.
- CMS, admin UI, or any editing interface for the YAML files.
- JavaScript interactivity within modules.
- Page-level metadata beyond `title` (e.g., SEO meta tags, Open Graph).
- Pagination or collection-based page generation.

## Further Notes

- The `format` opt-out flag on the text module uses `format: "html"` rather than a boolean like `markdown: false`, so it reads naturally and leaves room for future format values if needed.
- The module loop pattern is intentionally simple — a `for` loop with an `include`. No dynamic component registry or plugin system. If the set of module types grows significantly, this can be revisited.
- Since all pages are YAML-driven, there is no mechanism for per-page custom markup outside of modules. If a one-off page with custom HTML is needed in the future, that would require extending this system or reverting to a `.njk` page for that route.
