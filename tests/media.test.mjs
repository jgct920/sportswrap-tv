import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeHtml,normalizeVideo,normalizePodcast,decodeText} from '../media-utils.js';

test('existing video feeds retain their title and use a canonical watch URL',()=>{
  const item=normalizeVideo({videoId:'_SQcJuDMlKY',title:'Sports &amp; stories',url:'javascript:alert(1)'});
  assert.equal(item.title,'Sports & stories');
  assert.equal(item.url,'https://www.youtube.com/watch?v=_SQcJuDMlKY');
});
test('bad and missing video IDs keep the rendered fallback content',()=>{
  for(const item of [null,{}, {videoId:'../script'}, {videoId:'<script>'}])assert.equal(normalizeVideo(item),null);
});
test('shorts titles cannot introduce HTML or attributes',()=>{
  assert.equal(escapeHtml('<img src=x onerror="run()"> &'), '&lt;img src=x onerror=&quot;run()&quot;&gt; &amp;');
});
test('podcast playback uses the audio URL rather than malformed episode homepage links',()=>{
  const item=normalizePodcast({audioUrl:'https://cdn.example/episode.mp3?x=1&y=2',title:'LA&apos;s story',url:'Decibel88.com',published:'Mon, 19 Oct 2026 19:20:49 +0000'});
  assert.equal(item.title,"LA's story");assert.equal(item.audioUrl,'https://cdn.example/episode.mp3?x=1&y=2');assert.match(item.date,/October 19, 2026/);
});
test('invalid audio and dates fail safely without broken page labels',()=>{
  assert.equal(normalizePodcast({audioUrl:'javascript:alert(1)'}),null);
  assert.equal(normalizePodcast({audioUrl:'Decibel88.com'}),null);
  assert.equal(normalizePodcast({audioUrl:'https://cdn.example/file.mp3',published:'bad date'}).date,'');
});
test('feed entities decode once without treating titles as markup',()=>{
  assert.equal(decodeText('A &amp; B &quot;test&quot; &#39;x&#39;'),'A & B "test" \'x\'');
});
