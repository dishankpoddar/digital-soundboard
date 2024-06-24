var ready = 0;
var vcount = 0;

// Get playlist videos
async function getYouTubePlaylistVideos(playlistId, apiKey) {
    const baseUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
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
const apiKey = params.get("api");
let playerList = new Object();

window.onload = getYouTubePlaylistVideos(playlistId, apiKey).then(videos => {
    let board = document.querySelector('#board');
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    
    let cols = 4;
    if (vw < 768){
        cols = 1;
    } else if (vw < 992){
        cols = 2;
    } else if (vw < 1200){
        cols = 3;
    } else {
        cols = 4;
    }
    let rows = Math.ceil(videos.length/cols);
    vcount = videos.length;
    for (let i = 0; i < rows; i++){
        let row = `
            <div class="card-deck" >
        `
        for (let j = 0; j < cols; j++) {
            let index = i*cols + j;
            if (index < videos.length) {
                const video = videos[index];
                let videoElement = 
                `<div class="card text-white bg-dark mb-3">
                    <span id="player-${video.id}"></span>
                    <img src="https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg" class="card-img-top" alt="...">
                    <div class="card-img-overlay d-flex flex-column">
                    <p class="card-title mb-auto text-truncate cursor-pointer" title="${video.title}">${video.title}</p>
                    <div class="card-body d-flex align-items-end justify-content-around w-100">
                        <button type="button" class="btn btn-dark p-0" onclick="playpauseVideo('${video.id}')">
                            <span id="play-pause-${video.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>
                            </span>
                        </button>
                        <button type="button" class="btn btn-dark p-0" onclick="stopVideo('${video.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 6h12v12H6z"/></svg>
                        </button>
                        <button type="button" class="btn btn-dark p-0" onclick="volumeDown('${video.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                        </button>
                        <button type="button" class="btn btn-dark p-0" onclick="volumeUp('${video.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                        </button>
                        <!-- <span><svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg></span> -->
                    </div>
                    </div>
                </div>`;
                    row += videoElement;
            } else {
                let videoElement = `<div class="card text-white bg-dark mb-3"></div>`;
                row += videoElement;
            }
            
        }
        row += `</div>`;
        board.innerHTML += row;
    }
    videos.forEach(video => {
        playerList[video.id] = new YT.Player(`player-${video.id}`, {
            height: '0',
            width: '0',
            videoId: video.id,
            playerVars: {
                loop: 1,
                playlist: video.id,
                rel: 0,
                controls: 0,
                disablekb: 1,
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
            },
          });
    });
});

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.setVolume(50);
  ready += 1;
  if (ready == vcount){
    let alertBox = document.querySelector('#alertBox');
    alertBox.classList.remove('alert-warning');
    alertBox.classList.add('alert-success');
    alertBox.textContent = 'Playlist Loaded';
    setTimeout(function(){alertBox.style.display='none';}, 2000);
  }
}

function onPlayerStateChange(event){
    let player = event.target;
    let playpauseIcon = document.querySelector(`#play-pause-${player.playerInfo.videoData.video_id}`);
    
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }
    else if (player.getPlayerState() == YT.PlayerState.BUFFERING){
        playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="2rem" viewBox="0 0 20 20" width="2rem" fill="#DF9D9B"><g><rect fill="none" height="20" width="20"/></g><g><path d="M10,3c-3.87,0-7,3.13-7,7c0,3.87,3.13,7,7,7s7-3.13,7-7C17,6.13,13.87,3,10,3z M6.5,11c-0.55,0-1-0.45-1-1 c0-0.55,0.45-1,1-1s1,0.45,1,1C7.5,10.55,7.05,11,6.5,11z M10,11c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1s1,0.45,1,1 C11,10.55,10.55,11,10,11z M13.5,11c-0.55,0-1-0.45-1-1c0-0.55,0.45-1,1-1s1,0.45,1,1C14.5,10.55,14.05,11,13.5,11z"/></g></svg>`;
    }
    else {
        playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>`;
    }
}

// Control a video's playback.
function playpauseVideo(video_id){
    let player = playerList[video_id];
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else if (player.getPlayerState() == YT.PlayerState.PAUSED) {
        player.playVideo();
    }  else if (player.getPlayerState() == YT.PlayerState.BUFFERING) {
       // do nothing 
    }  else {
        player.seekTo(0, true);
        player.playVideo();
    }
}
function stopVideo(video_id){
    let player = playerList[video_id];
    player.stopVideo();
}
function volumeUp(video_id){
    let player = playerList[video_id];
    let vol = player.getVolume();
    player.setVolume(vol+5);
}

function volumeDown(video_id){
    let player = playerList[video_id];
    let vol = player.getVolume();
    player.setVolume(vol-5);
}