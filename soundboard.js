
// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Get playlist videos
async function getYouTubePlaylistVideos(playlistId, apiKey) {
  const baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
  console.log(baseUrl)
  let nextPageToken = '';
  const videos = [];

  try {
    do {
      const url = baseUrl + (nextPageToken ? `&pageToken=${nextPageToken}` : '');
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        for (const item of data.items) {
          const videoTitle = item.snippet.title;
          const videoId = item.snippet.resourceId.videoId;
          videos.push({ title: videoTitle, id: videoId });
        }
        nextPageToken = data.nextPageToken || '';
      } else {
        console.error(`Failed to retrieve playlist details: ${response.status}`);
        break;
      }
    } while (nextPageToken);
  } catch (error) {
    console.error(`Error fetching playlist details: ${error}`);
  }

  return videos;
}

let params = new URLSearchParams(document.location.search);
const playlistId = params.get("list");
const apiKey = '<API-KEY>';

getYouTubePlaylistVideos(playlistId, apiKey).then(videos => {
  videos.forEach(video => {
    console.log(`Title: ${video.title}, Video ID: ${video.id}`);
  });
});