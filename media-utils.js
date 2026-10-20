export const VIDEO_ID=/^[A-Za-z0-9_-]{11}$/;
export function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function decodeText(value=''){
  return String(value).replace(/&apos;|&#39;|&quot;|&lt;|&gt;|&amp;/g,entity=>({'&apos;':"'",'&#39;':"'",'&quot;':'"','&lt;':'<','&gt;':'>','&amp;':'&'}[entity]));
}
export function normalizeVideo(item){
  if(!item||!VIDEO_ID.test(item.videoId||''))return null;
  return {videoId:item.videoId,title:decodeText(item.title||'SportsWrap w/Jason Page'),url:`https://www.youtube.com/watch?v=${item.videoId}`};
}
export function normalizePodcast(item){
  if(!item||typeof item.audioUrl!=='string')return null;
  let audio;try{audio=new URL(item.audioUrl);}catch{return null;}
  if(audio.protocol!=='https:')return null;
  const date=new Date(item.published);
  return {audioUrl:audio.href,title:decodeText(item.title||'SportsWrap w/Jason Page'),date:Number.isFinite(date.getTime())?date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}):''};
}
