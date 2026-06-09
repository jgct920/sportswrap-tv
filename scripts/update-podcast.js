const fs = require("fs");
const https = require("https");
const path = require("path");

const feedUrl = process.env.PODCAST_RSS_URL || "https://feeds.simplecast.com/KCzCpgZ0";
const outputPath = path.join(process.cwd(), "data", "latest-podcast.json");

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
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
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

function getAttribute(tagText, attributeName) {
  const match = tagText.match(new RegExp(`${attributeName}=["']([^"']+)["']`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function matchAudioUrl(xml) {
  const candidateTags = xml.match(/<(enclosure|media:content|media:player)\b[^>]*>/gi) || [];

  for (const tag of candidateTags) {
    const url = getAttribute(tag, "url");
    const type = getAttribute(tag, "type").toLowerCase();

    if (url && (!type || type.includes("audio") || /\.(mp3|m4a|aac)(\?|$)/i.test(url))) {
      return url;
    }
  }

  const directAudioLink = xml.match(/https?:\/\/[^\s"'<>]+?\.(mp3|m4a|aac)(\?[^\s"'<>]*)?/i);
  return directAudioLink ? decodeXml(directAudioLink[0]) : "";
}

function matchGuidOrLink(xml) {
  return matchTag(xml, "link") || matchTag(xml, "guid");
}

async function main() {
  const xml = await fetchText(feedUrl);
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);

  if (!itemMatch) {
    throw new Error("No podcast episodes found in the RSS feed.");
  }

  const item = itemMatch[1];
  const title = matchTag(item, "title");
  const audioUrl = matchAudioUrl(item);
  const url = matchGuidOrLink(item);
  const published = matchTag(item, "pubDate");

  if (!audioUrl) {
    console.error(item.slice(0, 1200));
    throw new Error("Could not find an audio URL in the latest podcast episode.");
  }

  const latestPodcast = {
    title,
    audioUrl,
    url,
    published,
    updatedAt: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(latestPodcast, null, 2)}\n`);
  console.log(`Updated latest podcast: ${title}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
