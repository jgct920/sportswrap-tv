import {escapeHtml,normalizeVideo,normalizePodcast} from './media-utils.js';

async function readFeed(name){
  try{const response=await fetch(`data/${name}.json`,{cache:'no-store'});return response.ok?await response.json():null;}
  catch{return null;}
}

async function updateVideo(){
  const item=normalizeVideo(await readFeed('latest-video'));
  const button=document.querySelector('.media-play[data-video]');
  if(!item||!button)return;
  button.dataset.video=item.videoId;button.dataset.title=item.title;
  button.setAttribute('aria-label',`Play ${item.title}`);
  document.getElementById('home-watch-heading').textContent=item.title;
  const link=document.querySelector('.feature-video-copy a.button');if(link)link.href=item.url;
}
const shortPlayer = document.getElementById('short-player');
const choices = document.getElementById('short-choices');
let selectedByViewer = false;

function selectShort(videoId, play) {
  const url = new URL(shortPlayer.src);
  url.pathname = '/embed/' + videoId;
  url.searchParams.set('autoplay', play ? '1' : '0');
  shortPlayer.src = url.href;
  for (const button of choices.children) {
    button.setAttribute('aria-pressed', String(button.dataset.short === videoId));
  }
}

choices?.addEventListener('click', event => {
  const button = event.target.closest('[data-short]');
  if (!button) return;
  selectedByViewer = true;
  selectShort(button.dataset.short, true);
});

async function updateShorts() {
  if (!choices || !shortPlayer) return;
  const feed = await readFeed('latest-shorts');
  if (!Array.isArray(feed) || selectedByViewer) return;
  const items = feed.map(normalizeVideo).filter(Boolean).slice(0, 3);
  if (!items.length) return;
  choices.innerHTML = items.map((item, i) => `<button type="button" class="short-choice" data-short="${item.videoId}" aria-pressed="${i === 0}"><img src="https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg" alt="" loading="lazy"><span>${escapeHtml(item.title)}</span></button>`).join('');
  if (!new URL(shortPlayer.src).pathname.endsWith('/' + items[0].videoId)) {
    selectShort(items[0].videoId, false);
  }
}
async function updatePodcast(){
  const item=normalizePodcast(await readFeed('latest-podcast'));
  const audio=document.querySelector('.audio-copy audio');
  if(!item||!audio||!audio.paused)return;
  const heading=document.querySelector('.audio-copy>h3');if(heading)heading.textContent=item.title;
  const label=document.querySelector('.audio-copy>.eyebrow');if(label)label.textContent=`From the podcast${item.date?` · ${item.date}`:''}`;
  if(audio.src!==item.audioUrl)audio.src=item.audioUrl;
  audio.setAttribute('aria-label',`Play ${item.title}`);
}
await Promise.allSettled([updateVideo(),updateShorts(),updatePodcast()]);
