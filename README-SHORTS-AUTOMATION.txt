SportsWrap Shorts Automation
============================

This package adds a SportsWrap Shorts section to the homepage and a GitHub Action that can update it from a YouTube Shorts playlist.

Files added or changed:

- index.html
- styles.css
- script.js
- data/latest-shorts.json
- scripts/update-shorts.js
- .github/workflows/update-latest-shorts.yml

How it works:

1. You keep a YouTube playlist that contains SportsWrap Shorts.
2. GitHub checks that playlist every 6 hours, or manually when you click "Run workflow".
3. The script saves the newest 3 videos into data/latest-shorts.json.
4. The homepage loads that JSON file and displays the 3 Shorts.
5. Porkbun republishes from GitHub.

Setup steps:

1. Create or open your YouTube Shorts playlist.

2. Copy the playlist ID or full playlist URL.

3. In GitHub, open your sportswrap-tv repo.

4. Go to:
   Settings > Secrets and variables > Actions > Variables

5. Click "New repository variable".

6. Name it:
   SHORTS_PLAYLIST_ID

7. Set the value to your Shorts playlist ID or full playlist URL.

8. Save the variable.

9. In GitHub, go to Actions.

10. Click "Update latest YouTube Shorts".

11. Click "Run workflow".

    You can leave the optional playlist field blank if you saved SHORTS_PLAYLIST_ID as a variable.
    If you want to test a specific playlist immediately, paste the playlist ID or full playlist URL into
    that field.

12. After it finishes, confirm data/latest-shorts.json changed.

Important:

Use a playlist that only contains SportsWrap Shorts. The site displays the newest 3 videos from that playlist.
