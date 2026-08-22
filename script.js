let currentVideoId = "jfKfPfyJRdk";
let currentTitleText = "Lofi Beats to Study/Relax";
let currentArtistText = "Chillhop Music";
let currentCoverImg = "https://picsum.photos/200?random=25";
let isPlaying = false;

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

// Função de Navegação de Telas
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

if (searchBtn) {
    searchBtn.addEventListener('click', performUniversalSearch);
}
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performUniversalSearch();
    });
}

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

// Tocar Música Inserindo um Iframe Real na Página
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

    // Insere o iframe do YouTube diretamente no container invisível com autoplay ativado
    const container = document.getElementById('youtube-player-container');
    container.innerHTML = `
        <iframe width="300" height="150" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1" 
            frameborder="0" allow="autoplay">
        </iframe>
    `;
}

// Botão Play/Pause Global
const playBtn = document.getElementById('play-btn');
if (playBtn) {
    playBtn.addEventListener('click', () => {
        const container = document.getElementById('youtube-player-container');
        if (isPlaying) {
            container.innerHTML = ''; // Pausa removendo o iframe
            isPlaying = false;
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            playYouTubeSong(currentVideoId, currentTitleText, currentArtistText, currentCoverImg);
        }
    });
}

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
    if (!favoriteBtn) return;
    const exists = favorites.some(fav => fav.id === currentVideoId);
    if (exists) {
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #1db954;"></i>';
    } else {
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

function renderLibrary() {
    const libContainer = document.getElementById('library-list');
    if (!libContainer) return;
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
