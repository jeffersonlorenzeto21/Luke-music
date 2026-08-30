let currentVideoId = "jfKfPfyJRdk";
let currentTitleText = "Lofi Beats to Study/Relax";
let currentArtistText = "Chillhop Music";
let isPlaying = false;

// Banco de Dados Local com IDs reais do YouTube
const musicDatabase = [
    { title: "Leão", artist: "Marília Mendonça", id: "98_r4gwv5uc", genre: "Sertanejo", cover: "https://img.youtube.com/vi/98_r4gwv5uc/hqdefault.jpg" },
    { title: "Bloqueado", artist: "Gusttavo Lima", id: "075c3X94h6Q", genre: "Sertanejo", cover: "https://img.youtube.com/vi/075c3X94h6Q/hqdefault.jpg" },
    { title: "Bohemian Rhapsody", artist: "Queen", id: "fJ9rUzIMcZQ", genre: "Rock", cover: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", id: "hTWKbfoikeg", genre: "Rock", cover: "https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg" },
    { title: "Lofi Hip Hop - Beats to Relax", artist: "Lofi Girl", id: "jfKfPfyJRdk", genre: "Lofi", cover: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg" },
    { title: "Could You Be Loved", artist: "Bob Marley", id: "VOgfi_ycRI4", genre: "Reggae", cover: "https://img.youtube.com/vi/VOgfi_ycRI4/hqdefault.jpg" }
];

// Alternar entre Telas
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) targetScreen.classList.add('active');
    
    if(screenId === 'home') document.querySelectorAll('.nav-item')[0]?.classList.add('active');
    if(screenId === 'search') document.querySelectorAll('.nav-item')[1]?.classList.add('active');
    if(screenId === 'library') document.querySelectorAll('.nav-item')[2]?.classList.add('active');
}

// Abrir Gênero Corrigido
function openGenre(genreName) {
    const titleEl = document.getElementById('genre-title-screen');
    if (titleEl) titleEl.innerText = genreName;

    const filtered = musicDatabase.filter(m => m.genre.toLowerCase() === genreName.toLowerCase());
    const container = document.getElementById('genre-song-list');
    
    if (container) {
        container.innerHTML = "";
        if(filtered.length === 0) {
            container.innerHTML = `<p style="color: #b3b3b3;">Nenhuma música encontrada para ${genreName}.</p>`;
        } else {
            filtered.forEach(song => {
                container.innerHTML += `
                    <div class="song-card" onclick="playSong('${song.id}', '${song.title}', '${song.artist}')">
                        <img src="${song.cover}" alt="${song.title}">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                `;
            });
        }
    }
    switchScreen('genre');
}

// Tocar Música de forma certeira no Celular
function playSong(id, title, artist) {
    currentVideoId = id;
    currentTitleText = title;
    currentArtistText = artist;
    isPlaying = true;

    document.getElementById('current-title').innerText = title;
    document.getElementById('current-artist').innerText = artist;
    document.querySelector('#play-btn i').className = "fa-solid fa-pause";

    // Injeta o player do YouTube diretamente na página de forma visível e funcional para mobile
    let container = document.getElementById('youtube-player-container');
    if (container) {
        container.style.opacity = '1';
        container.style.zIndex = '998';
        container.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1" 
                title="YouTube player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }
}

// Botão de Play/Pause principal inferior
const playBtn = document.getElementById('play-btn');
if (playBtn) {
    playBtn.addEventListener('click', () => {
        let container = document.getElementById('youtube-player-container');
        if (isPlaying) {
            if (container) container.innerHTML = ''; // Pausa limpando o iframe
            isPlaying = false;
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            playSong(currentVideoId, currentTitleText, currentArtistText);
        }
    });
}

// Sistema de Busca
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const listContainer = document.getElementById('song-list');
    
    if (!query || !listContainer) return;

    listContainer.innerHTML = `<p style="color: #b3b3b3;">Buscando por "${query}"...</p>`;

    const results = musicDatabase.filter(m => 
        m.title.toLowerCase().includes(query) || m.artist.toLowerCase().includes(query)
    );

    setTimeout(() => {
        listContainer.innerHTML = "";
        if (results.length === 0) {
            listContainer.innerHTML = `
                <div class="song-card" onclick="playSong('jfKfPfyJRdk', '${query} (Mix)', 'Busca Luke Music')">
                    <img src="https://img.icons8.com/fluents/512/audio-wave.png" alt="Play">
                    <h4>${query}</h4>
                    <p>Toque para reproduzir</p>
                </div>
            `;
        } else {
            results.forEach(song => {
                listContainer.innerHTML += `
                    <div class="song-card" onclick="playSong('${song.id}', '${song.title}', '${song.artist}')">
                        <img src="${song.cover}" alt="${song.title}">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                `;
            });
        }
    }, 300);
}

// Favoritos
function toggleFavorite() {
    const favBtn = document.querySelector('#favorite-btn i');
    if (favBtn) {
        if (favBtn.classList.contains('fa-regular')) {
            favBtn.classList.remove('fa-regular');
            favBtn.classList.add('fa-solid');
            favBtn.style.color = '#1db954';
        } else {
            favBtn.classList.remove('fa-solid');
            favBtn.classList.add('fa-regular');
            favBtn.style.color = '#fff';
        }
    }
}
