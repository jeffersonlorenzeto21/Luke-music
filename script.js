// Tocar Música (Otimizado para Mobile)
function playYouTubeSong(videoId, title, artist, cover) {
    currentVideoId = videoId;
    currentTitleText = title;
    currentArtistText = artist;
    currentCoverImg = cover;
    isPlaying = true;

    document.getElementById('current-title').textContent = title;
    document.getElementById('current-artist').textContent = artist;
    document.getElementById('play-btn').innerHTML = '<i class="fa-solid fa-pause"></i>';
    updateFavoriteIcon();

    const container = document.getElementById('youtube-player-container');
    
    // Adicionamos parâmetros extras (playsinline, origin) que liberam o player em celulares
    container.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
        </iframe>
    `;
}
