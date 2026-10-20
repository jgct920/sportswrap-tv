const test = require('node:test');
const assert = require('node:assert/strict');
const {selectLatestVideo} = require('../scripts/update-youtube.js');
const entry = (id, date, title='Show') => `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${date}</published><updated>2026-10-20T00:00:00Z</updated></entry>`;

test('features newest published show even when the playlist puts an older show first', () => {
  const result = selectLatestVideo(`<feed>${entry('_SQcJuDMlKY','2026-10-15T18:23:26Z')}${entry('abcdefghijk','2026-10-19T18:00:00Z','Today &amp; sports')}${entry('lmnopqrstuv','2026-10-18T20:00:00Z')}</feed>`);
  assert.equal(result.videoId,'abcdefghijk');
  assert.equal(result.title,'Today & sports');
});
test('compares actual dates across timezone offsets rather than playlist updates', () => {
  assert.equal(selectLatestVideo(entry('abcdefghijk','2026-10-19T18:00:00-07:00')+entry('lmnopqrstuv','2026-10-20T00:00:00Z')).videoId,'abcdefghijk');
});
test('invalid entries cannot replace the featured video; an unusable feed fails', () => {
  assert.equal(selectLatestVideo(entry('bad','2026-10-20T00:00:00Z')+entry('abcdefghijk','invalid')+entry('_SQcJuDMlKY','2026-10-15T18:23:26Z')).videoId,'_SQcJuDMlKY');
  for(const xml of ['<feed/>',entry('abcdefghijk','invalid')])assert.throws(()=>selectLatestVideo(xml),/No videos/);
});

test('a stale playlist cannot replace a newer manually featured show, but a newer episode can', () => {
  const current={videoId:'VmFKDIkOE5E',title:'October 19 show',published:'2026-10-19'};
  assert.equal(selectLatestVideo(entry('_SQcJuDMlKY','2026-10-15T18:23:26Z'),current).videoId,current.videoId);
  assert.equal(selectLatestVideo(entry('abcdefghijk','2026-10-20T18:00:00Z'),current).videoId,'abcdefghijk');
});
