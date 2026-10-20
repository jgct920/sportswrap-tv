import {programs,sports,readState,filterPrograms,clipUrl} from './catalog.js';
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const query=$('#query'),kind=$('#kind'),grid=$('#program-grid'),dialog=$('#program-dialog');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=readState(new URLSearchParams(location.search));
let lastOpener;
const ornaments={
  'big-story':'<circle cx="80" cy="80" r="64"/><path d="M80 35v64M80 111v12"/>',
  baseball:'<circle cx="80" cy="80" r="70"/><path d="M36 25c44 20 44 90 0 110M124 25c-44 20-44 90 0 110M39 37l12 6M45 53l12 3M48 69h12M48 87l12-2M44 103l12-5M37 120l12-7M121 37l-12 6M115 53l-12 3M112 69h-12M112 87l-12-2M116 103l-12-5M123 120l-12-7"/>',
  basketball:'<circle cx="80" cy="80" r="70"/><path d="M10 80h140M80 10v140M30 30c65 14 86 64 100 100M130 30C65 44 44 94 30 130"/>',
  college:'<path d="M15 40h130v90H15zM80 40v90M15 85h130M27 40v90M133 40v90M15 52h130M15 118h130"/><path d="M47 40v8m0 74v8M112 40v8m0 74v8M64 40v8m0 74v8M96 40v8m0 74v8"/><circle cx="80" cy="85" r="20"/>',
  leftovers:'<path d="M12 125c5-72 42-108 136-112-3 95-44 132-112 136L12 125Z"/><path d="m36 124 88-88M52 93l14 14M63 81l14 14M75 69l14 14M87 57l14 14"/>',
  truth:'<path d="m20 82 35 35 79-80"/><circle cx="80" cy="80" r="67"/>',
  odds:'<path d="M20 30h120v80H80l-25 25v-25H20Z"/><circle cx="50" cy="70" r="5"/><circle cx="80" cy="70" r="5"/><circle cx="110" cy="70" r="5"/>'
};
function poster(item) {
  if(item.art==='show')return `<span class="poster poster-show"><span class="poster-brand">The flagship show</span><img class="card-show-logo" src="assets/show-logo.png" width="720" height="180" alt=""></span>`;
  return `<span class="poster poster-${item.art}"><span class="poster-brand">SportsWrap</span><span class="poster-sport">${esc(item.label)}</span><span class="poster-title">${item.poster}</span><span class="poster-ornament"><svg viewBox="0 0 160 160">${ornaments[item.art]||''}</svg></span></span>`;
}
function render(syncUrl=true) {
  query.value=state.q;kind.value=state.kind;
  $$('[data-sport]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sport===state.sport)));
  const items=filterPrograms(state);
  $('#result-count').textContent=`${items.length} ${items.length===1?'title':'titles'}${state.sport!=='all'?` · ${sports[state.sport]}`:''}${state.kind==='segment'?' · Recurring segments':state.kind==='program'?' · The show':''}`;
  $('#clear-search').hidden=!state.q;
  $('#reset-filters').hidden=!state.q&&state.sport==='all'&&state.kind==='all';
  $('#empty-state').hidden=items.length>0;grid.hidden=items.length===0;
  grid.innerHTML=items.map(item=>`<button class="program-card" data-program="${item.id}" type="button" aria-haspopup="dialog" aria-controls="program-dialog" aria-label="Explore ${esc(item.title)}"><span class="card-art" aria-hidden="true">${poster(item)}</span><span class="card-body"><span class="card-kicker">${item.kind==='program'?'Program':'Recurring segment'}<i aria-hidden="true"></i>${esc(item.label)}</span><span class="card-title">${esc(item.title)}</span><span class="card-description">${esc(item.description)}</span><span class="card-bottom"><span>${esc(item.voice)}</span><span class="card-arrow" aria-hidden="true">↗</span></span></span></button>`).join('');
  if(syncUrl){
    const url=new URL(location.href);['q','sport','kind'].forEach(key=>url.searchParams.delete(key));
    if(state.q)url.searchParams.set('q',state.q);
    if(state.sport!=='all')url.searchParams.set('sport',state.sport);
    if(state.kind!=='all')url.searchParams.set('kind',state.kind);
    history.replaceState(null,'',url);
  }
}
function reset(){state={q:'',sport:'all',kind:'all'};render();query.focus();}
query.addEventListener('input',()=>{state.q=query.value;render();});
kind.addEventListener('change',()=>{state.kind=kind.value;render();});
$('#filter-form').addEventListener('submit',event=>event.preventDefault());
$$('[data-sport]').forEach(button=>button.addEventListener('click',()=>{state.sport=button.dataset.sport;render();}));
$('#clear-search').addEventListener('click',()=>{state.q='';render();query.focus();});
$('#reset-filters').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);
window.addEventListener('popstate',()=>{state=readState(new URLSearchParams(location.search));render(false);});
grid.addEventListener('click',event=>{
  const button=event.target.closest('[data-program]');if(!button)return;
  const item=programs.find(entry=>entry.id===button.dataset.program);if(!item)return;
  lastOpener=button;
  $('#dialog-art').innerHTML=poster(item);
  $('#dialog-type').textContent=`${item.kind==='program'?'The show':'Recurring segment'} · ${item.label}`;
  $('#dialog-title').textContent=item.title;$('#dialog-description').textContent=item.detail;
  $('#dialog-facts').innerHTML=`<span>${esc(item.cadence)}</span><span>${esc(item.voice)}</span>`;
  $('#dialog-link').href=clipUrl(item);
  $('#dialog-link').innerHTML=`${item.kind==='program'?'Watch on YouTube':'Find clips on YouTube'} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span>`;
  $('#dialog-note').textContent=item.kind==='program'?'Opens the SportsWrap YouTube channel. For local TV airtimes, use the affiliate finder.':'Opens a search within the SportsWrap YouTube channel. Clip availability varies.';
  dialog.showModal();document.body.classList.add('modal-open');
});
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(lastOpener?.isConnected)lastOpener.focus();});
$('#dialog-watch').addEventListener('click',()=>{lastOpener=null;dialog.close();activateWatch('tv');$('#watch').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#tab-tv').focus({preventScroll:true});});
function activateWatch(value){
  $$('[data-watch]').forEach(tab=>{const active=tab.dataset.watch===value;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;const panel=$(`#panel-${tab.dataset.watch}`);panel.hidden=!active;panel.setAttribute('role','tabpanel');panel.tabIndex=0;});
}
$$('[data-watch]').forEach(tab=>tab.addEventListener('click',()=>activateWatch(tab.dataset.watch)));
$('#watch-tabs').addEventListener('keydown',event=>{
  const tabs=$$('[data-watch]');const index=tabs.indexOf(document.activeElement);
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||index<0)return;
  event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  activateWatch(tabs[next].dataset.watch);tabs[next].focus();
});
render(false);activateWatch('tv');$('#finder').hidden=false;$('#watch-tabs').hidden=false;$('#results-hint').hidden=false;
