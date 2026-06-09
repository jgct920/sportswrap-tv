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

async function loadLatestPodcast() {
  const audio = document.querySelector("[data-podcast-audio]");
  const title = document.querySelector("[data-podcast-title]");
  const date = document.querySelector("[data-podcast-date]");
  const link = document.querySelector("[data-podcast-link]");

  if (!audio || !title || !link) return;

  try {
    const response = await fetch("data/latest-podcast.json", { cache: "no-store" });
    if (!response.ok) return;

    const episode = await response.json();
    if (!episode.audioUrl) return;

    audio.src = episode.audioUrl;
    title.textContent = episode.title || "Latest SportsWrap w/Jason Page audio episode";
    link.href = episode.url || episode.audioUrl;

    if (date && episode.published) {
      date.textContent = new Date(episode.published).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    }
  } catch {
    // Keep the podcast links visible if episode data is unavailable.
  }
}

loadLatestPodcast();
