# Plan: YAML-Driven Modular Pages

> Source PRD: prd/yaml-module-pages.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Layout chain**: `page.njk` extends `base.njk`. All YAML-driven pages set `layout: page.njk`. `page.njk` owns the module loop; `base.njk` remains the HTML shell.
- **Module partials location**: `src/modules/` — excluded from Eleventy page output via config. Nunjucks include path is extended to resolve partials from this directory.
- **Module SCSS location**: `src/css/modules/` — one partial per module type (`_hero.scss`, `_text.scss`, `_split.scss`), imported into `main.scss`.
- **Page data format**: YAML files in `src/` (e.g., `src/index.yaml`) providing `layout`, `title`, and a `modules` list.
- **Module schema**: Each module entry has a required `type` field. All other fields are optional. Supported types: `hero`, `text`, `split`. Each type may include an optional `cta` object with `text` and `url`.
- **CTA pattern**: A shared partial or macro renders the CTA block. Each module partial conditionally includes it when `module.cta` is present.
- **Unknown type handling**: The module loop silently skips any module entry whose `type` does not match a known partial.

---

## Phase 1: Scaffolding & Hero Module

**User stories**: 1, 2, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21

### What to build

Wire up the full vertical path from a YAML data file to a rendered page with one working module type. Create the `page.njk` layout that extends `base.njk` and loops through a `modules` array, including the partial matching each entry's `type`. Configure Eleventy to add `src/modules/` as a Nunjucks include path and exclude it from page output. Build the `hero.njk` partial supporting optional `headline`, `subtext`, and `background_image` fields, along with its SCSS partial. Delete `src/index.njk` and replace it with `src/index.yaml` containing a hero module entry. The homepage should render the hero section entirely from YAML data. Verify that unknown module types are skipped without error, that reordering modules in the YAML changes the page output, and that adding or removing modules works as expected.

### Acceptance criteria

- [ ] `src/index.yaml` defines a page with `layout: page.njk`, a `title`, and a `modules` list containing a hero entry
- [ ] `src/index.njk` is deleted
- [ ] `page.njk` layout extends `base.njk` and loops through `modules`, including the partial for each known type
- [ ] Unknown module types in the YAML are silently skipped (no build error)
- [ ] `src/modules/hero.njk` renders headline, subtext, and background image — all fields optional
- [ ] `src/css/modules/_hero.scss` exists and is imported into `main.scss`
- [ ] Eleventy config excludes `src/modules/` from page output
- [ ] Eleventy config adds `src/modules/` as a Nunjucks include path
- [ ] The site builds and the homepage renders the hero from YAML data
- [ ] Adding, removing, or reordering modules in the YAML changes the rendered page accordingly

---

## Phase 2: Text Module with Markdown

**User stories**: 3, 4, 5, 6, 15

### What to build

Add the text module as a second module type, end-to-end. Create `text.njk` partial and its SCSS partial. Implement a Nunjucks filter that auto-detects whether the `body` field contains Markdown (using heuristics such as presence of `#`, `**`, `- `, fenced code blocks, etc.) and renders it to HTML. Support a `format: "html"` field on the module to opt out of Markdown processing, passing the body through as raw HTML. Add a text module entry to `src/index.yaml` and verify that Markdown body content renders correctly on the page, and that `format: "html"` bypasses Markdown rendering.

### Acceptance criteria

- [ ] `src/modules/text.njk` renders a `body` field
- [ ] `src/css/modules/_text.scss` exists and is imported into `main.scss`
- [ ] A Nunjucks filter auto-detects Markdown in `body` and renders it to HTML
- [ ] Setting `format: "html"` on the module skips Markdown processing and passes body through as raw HTML
- [ ] Omitting `format` triggers auto-detection
- [ ] The text module appears on the homepage when added to `src/index.yaml`
- [ ] A Markdown dependency is available in the build environment for rendering

---

## Phase 3: Split Module & CTA

**User stories**: 7, 8, 9, 10

### What to build

Add the split module and the shared CTA block, completing the initial module set. Create `split.njk` partial supporting `heading`, `body`, `image`, and `image_position` fields, with `image_position` defaulting to `"right"`. Create its SCSS partial with structural styles for the two-column layout and image positioning. Build a shared CTA partial or macro that renders a button/link from `cta.text` and `cta.url`. Wire the CTA into all three module partials (`hero.njk`, `text.njk`, `split.njk`), rendering it conditionally when `module.cta` is present. Add split module entries to `src/index.yaml` (one with default position, one with `image_position: left`) and CTA entries on at least one module of each type to verify everything works end-to-end.

### Acceptance criteria

- [ ] `src/modules/split.njk` renders heading, body, and image in a two-column layout
- [ ] `image_position` defaults to `"right"` when omitted
- [ ] Setting `image_position: "left"` places the image on the left
- [ ] `src/css/modules/_split.scss` exists and is imported into `main.scss`
- [ ] A shared CTA partial or macro renders a linked button from `cta.text` and `cta.url`
- [ ] CTA renders conditionally on hero, text, and split modules when `module.cta` is present
- [ ] CTA does not render when `module.cta` is absent
- [ ] The homepage demonstrates all three module types with at least one CTA
