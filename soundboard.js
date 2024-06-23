
// This code loads the IFrame Player API code asynchronously.
// var tag = document.createElement('script');

// tag.src = "https://www.youtube.com/iframe_api";
// var firstScriptTag = document.getElementsByTagName('script')[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
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
                                <!--
                                    <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                -->
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
            },
          });
    });
});

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
//   event.target.stopVideo(); 
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


// Control a video's playback.
function playpauseVideo(video_id){
    let player = playerList[video_id];
    let playpauseIcon = document.querySelector(`#play-pause-${video_id}`);
    // alert(player.getPlayerState());
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        player.pauseVideo();
        playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>`;
    } else if (player.getPlayerState() == YT.PlayerState.BUFFERING) {
        player.playVideo();
        while (player.getPlayerState() == YT.PlayerState.BUFFERING) {
            playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 24 24" width="40px" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>`;
        }
        // player.pauseVideo();
        playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }
    else {
        player.playVideo();
        playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    } 
}
function stopVideo(video_id){
    let player = playerList[video_id];
    player.stopVideo();
    let playpauseIcon = document.querySelector(`#play-pause-${video_id}`);
    playpauseIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 24 24" width="2rem" fill="#DF9D9B"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>`;
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