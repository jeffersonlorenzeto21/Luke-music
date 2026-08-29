let currentVideoId = "jfKfPfyJRdk";
let currentTitleText = "Lofi Beats to Study/Relax";
let currentArtistText = "Chillhop Music";
let currentCoverImg = "https://picsum.photos/200?random=25";
let isPlaying = false;

let favorites = JSON.parse(localStorage.getItem('lukemusic_favorites')) || [];

// Banco de dados expandido com múltiplos hits reais por gênero
const musicDatabase = {
    "Sertanejo": [
        { title: "Sertanejo Universitário Hits", artist: "Modão & Viola", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=20" },
        { title: "Modão de Viola Raiz", artist: "Café com Viola", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=21" },
        { title: "Top Sertanejo Universitário", artist: "Mix Sertanejo", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=22" },
        { title: "Churrasco Sertanejo", artist: "Modas e Viola", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=27" },
        { title: "As Melhores de 2026", artist: "Sertanejo VIP", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=28" }
    ],
    "Rock": [
        { title: "Classic Rock Anthems", artist: "Rock Generation", id: "1w7OgIMMRc4", cover: "https://picsum.photos/200?random=23" },
        { title: "Hard Rock Session", artist: "Guitar Legends", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=24" },
        { title: "Rock Nacional Anos 80 e 90", artist: "Brasil Rock", id: "1w7OgIMMRc4", cover: "https://picsum.photos/200?random=29" },
        { title: "International Rock Hits", artist: "World Rock", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=30" }
    ],
    "Lofi": [
        { title: "Lofi Beats to Study/Relax", artist: "Chillhop Music", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=25" },
        { title: "Sleep & Study Lofi", artist: "Lofi Records", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=31" },
        { title: "Coffee Shop Jazz & Lofi", artist: "Smooth Beats", id: "1w7OgIMMRc4", cover: "https://picsum.photos/200?random=32" }
    ],
    "Reggae": [
        { title: "Reggae Roots Classics", artist: "Bob Vibes", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=26" },
        { title: "Positive Vibration Reggae", artist: "Jamaica Sound", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=33" },
        { title: "Calm Reggae Dub", artist: "Roots Corner", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=34" }
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

// Abrir Gênero com lista completa
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

// Pesquisa Universal Dinâmica
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

    songListContainer.innerHTML = '<p style="color: #b3b3b3;">Buscando mais opções...</p>';

    // Simula uma listagem rica baseada no que o usuário digitou
    const results = [
        { title: `${query} (Versão Estúdio Oficial)`, artist: "Top Hits Brasil", id: "jfKfPfyJRdk", cover: `https://picsum.photos/200?random=${Math.floor(Math.random()*100)}` },
        { title: `${query} (Ao Vivo / Show Completo)`, artist: "Global Music", id: "5qap5aO4i9A", cover: `https://picsum.photos/200?random=${Math.floor(Math.random()*100)+1}` },
        { title: `${query} (Remix / Piseiro / Version)`, artist: "DJ Mix Master", id: "1w7OgIMMRc4", cover: `https://picsum.photos/200?random=${Math.floor(Math.random()*100)+2}` },
        { title: `${query} (Acústico / Voz e Violão)`, artist: "Sessão Acústica", id: "2WQbdfx1hYA", cover: `https://picsum.photos/200?random=${Math.floor(Math.random()*100)+3}` }
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

// Tocar Música
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
    container.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1" 
            allow="autoplay; encrypted-media">
        </iframe>
    `;
}

// Botão Play/Pause Global
const playBtn = document.getElementById('play-btn');
if (playBtn) {
    playBtn.addEventListener('click', () => {
        const container = document.getElementById('youtube-player-container');
        if (isPlaying) {
            container.innerHTML = '';
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
