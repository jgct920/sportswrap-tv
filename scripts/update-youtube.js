const fs = require("fs");
const https = require("https");
const path = require("path");

const playlistIdInput = process.env.YOUTUBE_PLAYLIST_ID || "";
const outputPath = path.join(process.cwd(), "data", "latest-video.json");

function normalizePlaylistId(value) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "PASTE_YOUR_PLAYLIST_ID_HERE") {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("list") || trimmed;
  } catch {
    return trimmed;
  }
}

const playlistId = normalizePlaylistId(playlistIdInput);

if (require.main === module && !playlistId) {
  console.error("Missing YOUTUBE_PLAYLIST_ID. Add it as a GitHub repository variable or enter it when running the workflow manually.");
  process.exit(1);
}

const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Request failed with status ${response.statusCode}`));
          response.resume();
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

function decodeXml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function matchTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

function selectLatestVideo(xml, currentVideo = null) {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(match => {
    const entry = match[1];
    return {
      videoId: matchTag(entry, "yt:videoId"),
      title: matchTag(entry, "title"),
      published: matchTag(entry, "published")
    };
  }).filter(video => /^[A-Za-z0-9_-]{11}$/.test(video.videoId) && Number.isFinite(Date.parse(video.published)));

  if (!entries.length) {
    throw new Error("No videos with valid IDs and publication dates found in the playlist feed.");
  }

  // Playlist position is editorial ordering, not necessarily publication order.
  entries.sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  if (currentVideo && /^[A-Za-z0-9_-]{11}$/.test(currentVideo.videoId) &&
      Date.parse(currentVideo.published) > Date.parse(entries[0].published)) {
    return currentVideo;
  }
  return entries[0];
}

async function main() {
  const xml = await fetchText(feedUrl);
  const currentVideo = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, "utf8")) : null;
  const { videoId, title, published } = selectLatestVideo(xml, currentVideo);

  const latestVideo = {
    videoId,
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    published,
    updatedAt: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(latestVideo, null, 2)}\n`);
  console.log(`Updated latest video: ${title} (${videoId})`);
}

module.exports = { selectLatestVideo };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
