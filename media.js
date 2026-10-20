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
async function updateShorts(){
  const feed=await readFeed('latest-shorts');
  const grid=document.querySelector('.shorts-grid');
  if(!grid||!Array.isArray(feed))return;
  const items=feed.map(normalizeVideo).filter(Boolean).slice(0,3);
  if(!items.length)return;
  grid.innerHTML=items.map((item,index)=>`<article class="short-tile"><a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${escapeHtml(item.title)} on YouTube (opens in a new tab)"><div class="short-image"><span class="short-brand" aria-hidden="true">SPORTSWRAP<br><span>SHORTS</span></span><span class="short-number">0${index+1}</span><span class="short-play" aria-hidden="true">↗</span></div><div class="short-copy"><p class="eyebrow ink-eyebrow">Quick-hit conversation</p><h3>${escapeHtml(item.title)}</h3></div></a></article>`).join('');
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
