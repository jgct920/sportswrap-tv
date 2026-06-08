const fs = require("fs");
const https = require("https");
const path = require("path");

const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
const outputPath = path.join(process.cwd(), "data", "latest-video.json");

if (!playlistId || playlistId === "PASTE_YOUR_PLAYLIST_ID_HERE") {
  console.error("Missing YOUTUBE_PLAYLIST_ID. Add your playlist ID in the GitHub Action.");
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

async function main() {
  const xml = await fetchText(feedUrl);
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);

  if (!entryMatch) {
    throw new Error("No videos found in the playlist feed.");
  }

  const entry = entryMatch[1];
  const videoId = matchTag(entry, "yt:videoId");
  const title = matchTag(entry, "title");
  const published = matchTag(entry, "published");

  if (!videoId) {
    throw new Error("Could not find a YouTube video ID in the playlist feed.");
  }

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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
