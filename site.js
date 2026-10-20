const menus=[...document.querySelectorAll('.site-menu')];
menus.forEach(menu=>{
  menu.addEventListener('click',event=>{if(event.target.closest('a'))menu.open=false;});
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});
});
document.addEventListener('click',event=>menus.forEach(menu=>{if(!menu.contains(event.target))menu.open=false;}));

document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.video;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
  const frame=document.createElement('iframe');
  frame.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  frame.title=button.dataset.title||'SportsWrap video';
  frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  button.replaceWith(frame);frame.focus();
}));

const affiliateFrame=document.getElementById('sportswrap-affiliate-map');
if(affiliateFrame)window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==affiliateFrame.contentWindow||event.data?.type!=='sportswrap-affiliate-map-height')return;
  const height=Number(event.data.height);
  if(Number.isFinite(height)&&height>200&&height<10000)affiliateFrame.style.height=`${Math.ceil(height)}px`;
});

const form=document.getElementById('inquiry-form');
if(form){
  const topic=new URLSearchParams(location.search).get('inquiry');
  const select=document.getElementById('inquiry-type');
  if([...select.options].some(option=>option.value===topic))select.value=topic;
}
