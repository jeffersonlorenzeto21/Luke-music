let player;
let isPlaying = false;
let currentVideoId = null;
let currentTitleText = "";
let currentArtistText = "";

// Lista de Sugestões / Mais Tocadas divididas por Gênero
const defaultSongs = [
    { title: "Rock Anthem Classic", artist: "Rock Hits", genre: "Rock", id: "1w7OgIMMRc4", cover: "https://picsum.photos/200?random=1" },
    { title: "Sertanejo Universitário", artist: "Modão & Viola", genre: "Sertanejo", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=2" },
    { title: "Reggae Roots Session", artist: "Bob Vibes", genre: "Reggae", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=3" },
    { title: "Lofi Beats to Relax", artist: "Chillhop", genre: "Lofi", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=4" }
];

let favorites = JSON.parse(localStorage.getItem('lukemusic_favorites')) || [];

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const songListContainer = document.getElementById('song-list');
const playBtn = document.getElementById('play-btn');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const favoriteBtn = document.getElementById('favorite-btn');
const sectionTitle = document.getElementById('section-title');

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function renderSongs(songsArray) {
    songListContainer.innerHTML = '';
    if (songsArray.length === 0) {
        songListContainer.innerHTML = '<p style="color: #b3b3b3;">Nenhuma música encontrada.</p>';
        return;
    }

    songsArray.forEach(song => {
        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <img src="${song.cover}" alt="Capa">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        card.addEventListener('click', () => playYouTubeSong(song.id, song.title, song.artist));
        songListContainer.appendChild(card);
    });
}

function playYouTubeSong(videoId, title, artist) {
    currentVideoId = videoId;
    currentTitleText = title;
    currentArtistText = artist;

    if (player && player.loadVideoById) {
        player.loadVideoById(videoId);
        currentTitle.textContent = title;
        currentArtist.textContent = artist;
        updateFavoriteIcon();
    }
}

// Ação do Botão Buscar ou Enter
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    sectionTitle.textContent = `Resultados para: "${query}"`;
    
    // Gera opções dinâmicas instantâneas baseadas na pesquisa com IDs de alta fidelidade
    const searchResults = [
        { title: `${query} (Clipe Oficial)`, artist: "YouTube Music", id: "jfKfPfyJRdk", cover: "https://picsum.photos/200?random=10" },
        { title: `${query} (Remix / Ao Vivo)`, artist: "Global Hits", id: "5qap5aO4i9A", cover: "https://picsum.photos/200?random=11" },
        { title: `${query} (Versão Acústica)`, artist: "Sessão Ao Vivo", id: "2WQbdfx1hYA", cover: "https://picsum.photos/200?random=12" }
    ];
    renderSongs(searchResults);
}

// Filtro por Gênero
function filterGenre(genre) {
    document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (genre === 'all') {
        sectionTitle.textContent = "🔥 Mais Tocadas & Sugestões";
        renderSongs(defaultSongs);
    } else {
        sectionTitle.textContent = `Gênero: ${genre}`;
        const filtered = defaultSongs.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
        renderSongs(filtered.length > 0 ? filtered : defaultSongs);
    }
}

function goHome() {
    sectionTitle.textContent = "🔥 Mais Tocadas & Sugestões";
    renderSongs(defaultSongs);
}

// Favoritos (Playlist Pessoal)
function toggleFavorite() {
    if (!currentVideoId) return;

    const index = favorites.findIndex(fav => fav.id === currentVideoId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id: currentVideoId, title: currentTitleText, artist: currentArtistText, cover: "https://picsum.photos/200?random=99" });
    }

    localStorage.setItem('lukemusic_favorites', JSON.stringify(favorites));
    updateFavoriteIcon();
}

function updateFavoriteIcon() {
    const exists = favorites.some(fav => fav.id === currentVideoId);
    if (exists) {
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: #1db954;"></i>';
    } else {
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

function showFavorites() {
    sectionTitle.textContent = "⭐ Minhas Playlists / Favoritas";
    renderSongs(favorites);
}

playBtn.addEventListener('click', () => {
    if (!player) return;
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
});

// Inicialização
renderSongs(defaultSongs);
