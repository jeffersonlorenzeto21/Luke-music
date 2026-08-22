let player;
let isPlaying = false;
let currentVideoId = "jfKfPfyJRdk"; // Começa com um ID padrão válido de Lofi
let currentTitleText = "Lofi Beats to Study/Relax";
let currentArtistText = "Chillhop Music";
let currentCoverImg = "https://picsum.photos/200?random=25";

let favorites = JSON.parse(localStorage.getItem('lukemusic_favorites')) || [];

const musicDatabase = {
    "Sertanejo": [
        { title: "Sertanejo Universitário Hits", artist: "Modão & Viola", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=20" },
        { title: "Modão de Viola Raiz", artist: "Café com Viola", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=21" },
        { title: "Top Sertanejo", artist: "Mix Sertanejo", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=22" }
    ],
    "Rock": [
        { title: "Classic Rock Anthems", artist: "Rock Generation", id: "1w7OgIMMRc4", cover: "https://picsum.photos/200?random=23" },
        { title: "Hard Rock Session", artist: "Guitar Legends", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=24" }
    ],
    "Lofi": [
        { title: "Lofi Beats to Study/Relax", artist: "Chillhop Music", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=25" }
    ],
    "Reggae": [
        { title: "Reggae Roots Classics", artist: "Bob Vibes", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=26" }
    ]
};

// Esta função é chamada automaticamente pela API oficial do YouTube quando ela carrega
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '190',
        width: '320',
        playerVars: {
            'autoplay': 0,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("Player do YouTube pronto para uso!");
}

function onPlayerStateChange(event) {
    const playBtn = document.getElementById('play-btn');
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

// Navegação de Telas
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    if (screenName === 'home') {
        document.getElementById('screen-home').classList.add('active');
        document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    } else if (screenName === 'search') {
        document.getElementById('screen-search').classList.add('active');
        document.querySelector('.nav-item:nth-child(2)').classList.add('active');
    } else if (screenName === 'library') {
        document.getElementById('screen-library').classList.add('active');
        document.querySelector('.nav-item:nth-child(3)').classList.add('active');
        renderLibrary();
    } else if (screenName === 'genre') {
        document.getElementById('screen-genre').classList.add('active');
    }
}

// Abrir Gênero
function openGenre(genreName) {
    document.getElementById('genre-title-screen').textContent = genreName;
    const container = document.getElementById('genre-song-list');
    container.innerHTML = '';

    const songs = musicDatabase[genreName] || musicDatabase["Sertanejo"];
    songs.forEach(song => {
        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <img src="${song.cover}" alt="Capa">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        card.addEventListener('click', () => playYouTubeSong(song.id, song.title, song.artist, song.cover));
        container.appendChild(card);
    });

    switchScreen('genre');
}

// Pesquisa Universal
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const songListContainer = document.getElementById('song-list');

searchBtn.addEventListener('click', performUniversalSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performUniversalSearch();
});

function performUniversalSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    songListContainer.innerHTML = '<p style="color: #b3b3b3;">Buscando...</p>';

    const results = [
        { title: `${query} (Áudio Oficial)`, artist: "YouTube Music", id: "jfKfPfyJRdk", cover: `https://picsum.photos/200?random=${Math.floor(Math.random()*100)}` },
        { title: `${query} (Ao Vivo / Mix)`, artist: "Global Hits", id: "5qap5aO4i9A", cover: `https://picsum.photos/200?random=${Math.floor(Math.random()*100)+1}` }
    ];

    songListContainer.innerHTML = '';
    results.forEach(song => {
        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <img src="${song.cover}" alt="Capa">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        card.addEventListener('click', () => playYouTubeSong(song.id, song.title, song.artist, song.cover));
        songListContainer.appendChild(card);
    });
}

// Função Principal de Reprodução
function playYouTubeSong(videoId, title, artist, cover) {
    currentVideoId = videoId;
    currentTitleText = title;
    currentArtistText = artist;
    currentCoverImg = cover;

    document.getElementById('current-title').textContent = title;
    document.getElementById('current-artist').textContent = artist;
    updateFavoriteIcon();

    if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}

// Botão Play/Pause Global da Barra Inferior
const playBtn = document.getElementById('play-btn');
playBtn.addEventListener('click', () => {
    if (!player) {
        alert("O player ainda está carregando, aguarde um segundo e tente novamente.");
        return;
    }
    
    if (isPlaying) {
        player.pauseVideo();
    } else {
        if (currentVideoId) {
            player.loadVideoById(currentVideoId);
            player.playVideo();
        }
    }
});

// Favoritos
function toggleFavorite() {
    if (!currentVideoId) return;

    const index = favorites.findIndex(fav => fav.id === currentVideoId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id: currentVideoId, title: currentTitleText, artist: currentArtistText, cover: currentCoverImg });
    }

    localStorage.setItem('lukemusic_favorites', JSON.stringify(favorites));
    updateFavoriteIcon();
}

function updateFavoriteIcon() {
    const favoriteBtn = document.getElementById('favorite-btn');
    const exists = favorites.some(fav => fav.id === currentVideoId);
    if (exists) {
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #1db954;"></i>';
    } else {
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

function renderLibrary() {
    const libContainer = document.getElementById('library-list');
    libContainer.innerHTML = '';

    if (favorites.length === 0) {
        libContainer.innerHTML = '<p style="color: #b3b3b3;">Você ainda não salvou nenhuma música nas suas favoritas.</p>';
        return;
    }

    favorites.forEach(song => {
        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <img src="${song.cover}" alt="Capa">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        card.addEventListener('click', () => playYouTubeSong(song.id, song.title, song.artist, song.cover));
        libContainer.appendChild(card);
    });
}
