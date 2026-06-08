const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => event.preventDefault());
});

async function loadLatestVideo() {
  const embed = document.querySelector("[data-youtube-embed]");
  const title = document.querySelector("[data-video-title]");
  const link = document.querySelector("[data-video-link]");

  if (!embed || !title || !link) return;

  try {
    const response = await fetch("data/latest-video.json", { cache: "no-store" });
    if (!response.ok) return;

    const video = await response.json();
    if (!video.videoId) return;

    embed.src = `https://www.youtube.com/embed/${video.videoId}`;
    embed.classList.add("is-loaded");
    title.textContent = video.title || "Latest SportsWrap w/Jason Page episode";
    link.href = video.url || `https://www.youtube.com/watch?v=${video.videoId}`;
  } catch {
    // Keep the fallback embed visible if the latest-video data is unavailable.
  }
}

loadLatestVideo();
