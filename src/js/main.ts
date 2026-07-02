const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const nav = document.querySelector<HTMLElement>("[data-nav]");
const labelOpen = toggle?.querySelector<HTMLElement>("[data-nav-label-open]");
const labelClose = toggle?.querySelector<HTMLElement>("[data-nav-label-close]");

if (toggle && nav && labelOpen && labelClose) {
  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    labelOpen.hidden = open;
    labelClose.hidden = !open;
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
}

// Lightbox for image-grid modules -------------------------------------------

const lightboxTriggers = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-lightbox-trigger]"),
);

if (lightboxTriggers.length > 0) {
  type Slide = { src: string; alt: string; caption: string };

  const slideOf = (trigger: HTMLButtonElement): Slide => ({
    src: trigger.dataset.fullSrc ?? "",
    alt: trigger.dataset.fullAlt ?? "",
    caption: trigger.dataset.caption ?? "",
  });

  // One dialog serves every grid on the page; prev/next stays within the
  // grid that was opened.
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Image viewer");
  dialog.innerHTML = `
    <div class="lightbox__inner" data-lightbox-inner>
      <img class="lightbox__image" alt="" />
      <p class="lightbox__caption" data-lightbox-caption hidden></p>
    </div>
    <button type="button" class="lightbox__close" data-lightbox-close aria-label="Close image viewer">&times;</button>
    <button type="button" class="lightbox__nav lightbox__nav--prev" data-lightbox-prev aria-label="Previous image">&lsaquo;</button>
    <button type="button" class="lightbox__nav lightbox__nav--next" data-lightbox-next aria-label="Next image">&rsaquo;</button>
  `;
  document.body.appendChild(dialog);

  const image = dialog.querySelector<HTMLImageElement>(".lightbox__image")!;
  const caption = dialog.querySelector<HTMLElement>("[data-lightbox-caption]")!;
  const inner = dialog.querySelector<HTMLElement>("[data-lightbox-inner]")!;
  const prevBtn = dialog.querySelector<HTMLButtonElement>("[data-lightbox-prev]")!;
  const nextBtn = dialog.querySelector<HTMLButtonElement>("[data-lightbox-next]")!;

  let current: Slide[] = [];
  let index = 0;

  const render = () => {
    const slide = current[index];
    if (!slide) return;
    image.src = slide.src;
    image.alt = slide.alt;
    caption.textContent = slide.caption;
    caption.hidden = slide.caption === "";
    const many = current.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
  };

  const go = (delta: number) => {
    if (current.length === 0) return;
    index = (index + delta + current.length) % current.length;
    render();
  };

  const open = (group: Slide[], start: number) => {
    current = group;
    index = start;
    render();
    dialog.showModal();
  };

  // Resolve each grid's slides once, and remember every trigger's position.
  const groups = new Map<Element, Slide[]>();
  lightboxTriggers.forEach((trigger) => {
    const grid = trigger.closest("[data-lightbox-grid]") ?? trigger;
    let group = groups.get(grid);
    if (!group) {
      const inGrid = Array.from(
        grid.querySelectorAll<HTMLButtonElement>("[data-lightbox-trigger]"),
      );
      group = inGrid.map(slideOf);
      groups.set(grid, group);
      inGrid.forEach((t, i) => (t.dataset.lightboxIndex = String(i)));
    }
    trigger.addEventListener("click", () => {
      open(group!, Number(trigger.dataset.lightboxIndex ?? 0));
    });
  });

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));
  dialog
    .querySelector<HTMLButtonElement>("[data-lightbox-close]")!
    .addEventListener("click", () => dialog.close());

  // Clicking the backdrop area (the dialog or the empty inner surface, but not
  // the image itself) closes the viewer.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target === inner) dialog.close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  });

  // Drop the src on close so the previous image never flashes on reopen.
  dialog.addEventListener("close", () => image.removeAttribute("src"));
}
