SportsWrap YouTube Automation
=============================

This package includes a GitHub Action that can update the Watch section from a YouTube playlist.

Files added:

- data/latest-video.json
- scripts/update-youtube.js
- .github/workflows/update-latest-video.yml

How it works:

1. GitHub runs the workflow every 6 hours, or manually when you click "Run workflow".
2. The script reads the newest video from your YouTube playlist RSS feed.
3. It updates data/latest-video.json.
4. The homepage loads that JSON file and embeds the video.
5. Porkbun republishes from GitHub.

Setup steps:

1. Open your YouTube playlist in a browser.
2. Copy the playlist ID from the URL.

   Example:
   https://www.youtube.com/playlist?list=PLabc123

   The playlist ID is:
   PLabc123

3. In GitHub, open your sportswrap-tv repo.

4. Go to:
   Settings > Secrets and variables > Actions > Variables

5. Click "New repository variable".

6. Name it:
   YOUTUBE_PLAYLIST_ID

7. Set the value to your actual playlist ID. A full YouTube playlist URL will also work.

8. Save the variable.

9. In GitHub, go to Actions.

10. Click "Update latest YouTube video".

11. Click "Run workflow".

    You can leave the optional playlist field blank if you saved YOUTUBE_PLAYLIST_ID as a variable.
    If you want to test a specific playlist immediately, paste the playlist ID or full playlist URL into
    that field.

12. After it finishes, confirm data/latest-video.json changed.

The workflow now reads the playlist ID from the GitHub repository variable. You should not need to
edit the workflow file every time.

Important:

Use a playlist that only contains full SportsWrap w/Jason Page episodes. If Shorts or unrelated clips
are added to the playlist, they can become the featured Watch video.
