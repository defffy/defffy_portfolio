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
