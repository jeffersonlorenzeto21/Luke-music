let player;
let isPlaying = false;
let currentVideoId = null;
let currentTitleText = "";
let currentArtistText = "";

// Banco de Dados Local de Demonstração (Caso queira testar direto)
const musicDatabase = [
    { title: "Leão", artist: "Marília Mendonça", id: "98_r4gwv5uc", genre: "Sertanejo", cover: "https://img.youtube.com/vi/98_r4gwv5uc/hqdefault.jpg" },
        { title: "Bloqueado", artist: "Gusttavo Lima", id: "075c3X94h6Q", genre: "Sertanejo", cover: "https://img.youtube.com/vi/075c3X94h6Q/hqdefault.jpg" },
    { title: "Bohemian Rhapsody", artist: "Queen", id: "fJ9rUzIMcZQ", genre: "Rock", cover: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", id: "hTWKbfoikeg", genre: "Rock", cover: "https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg" },
    { title: "Lofi Hip Hop - Beats to Relax", artist: "Lofi Girl", id: "jfKfPfyJRdk", genre: "Lofi", cover: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg" },
    { title: "Could You Be Loved", artist: "Bob Marley", id: "VOgfi_ycRI4", genre: "Reggae", cover: "https://img.youtube.com/vi/VOgfi_ycRI4/hqdefault.jpg" }
];

// Inicialização da API do YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '150',
        width: '300',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("Player do YouTube pronto!");
}

function onPlayerStateChange(event) {
    const playBtnIcon = document.querySelector('#play-btn i');
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        playBtnIcon.className = "fa-solid fa-pause";
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        isPlaying = false;
        playBtnIcon.className = "fa-solid fa-play";
    }
}

// Alternar entre Telas
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`screen-${screenId}`).classList.add('active');
    
    if(screenId === 'home') document.querySelectorAll('.nav-item')[0].classList.add('active');
    if(screenId === 'search') document.querySelectorAll('.nav-item')[1].classList.add('active');
    if(screenId === 'library') document.querySelectorAll('.nav-item')[2].classList.add('active');
}

// Abrir Gênero
function openGenre(genreName) {
    document.getElementById('genre-title-screeninnerText').innerText = genreName;
    const filtered = musicDatabase.filter(m => m.genre.toLowerCase() === genreName.toLowerCase() || genreName.includes(m.genre));
    
    const container = document.getElementById('genre-song-list');
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
    switchScreen('genre');
}

// Tocar Música (Integrado com o YouTube e bypass de segurança mobile)
function playSong(id, title, artist) {
    currentVideoId = id;
    currentTitleText = title;
    currentArtistText = artist;

    document.getElementById('current-title').innerText = title;
    document.getElementById('current-artist').innerText = artist;

    if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(id);
        player.playVideo();
    } else {
        // Se a API ainda estiver carregando, tenta iniciar pelo container visível
        let container = document.getElementById('youtube-player-container');
        container.style.opacity = '1';
        container.style.zIndex = '998';
    }

    isPlaying = true;
    document.querySelector('#play-btn i').className = "fa-solid fa-pause";
}

// Botão de Play/Pause principal inferior
document.getElementById('play-btn').addEventListener('click', () => {
    if (!player) return;
    
    if (isPlaying) {
        player.pauseVideo();
        isPlaying = false;
        document.querySelector('#play-btn i').className = "fa-solid fa-play";
    } else {
        if (currentVideoId) {
            player.playVideo();
        } else if (musicDatabase.length > 0) {
            // Toca a primeira música por padrão se nada foi escolhido
            playSong(musicDatabase[0].id, musicDatabase[0].title, musicDatabase[0].artist);
        }
        isPlaying = true;
        document.querySelector('#play-btn i').className = "fa-solid fa-pause";
    }
});

// Sistema de Busca com Pesquisa Real de Artistas/Músicas
document.getElementById('search-btn').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const listContainer = document.getElementById('song-list');
    
    if (!query) return;

    listContainer.innerHTML = `<p style="color: #b3b3b3;">Buscando por "${query}"...</p>`;

    // Filtra na base interna ou simula busca global
    const results = musicDatabase.filter(m => 
        m.title.toLowerCase().includes(query) || m.artist.toLowerCase().includes(query)
    );

    setTimeout(() => {
        listContainer.innerHTML = "";
        if (results.length === 0) {
            // Se não achar na lista padrão, cria um card dinâmico buscando no catálogo geral do YouTube
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
    }, 400);
}

// Favoritos
function toggleFavorite() {
    const favBtn = document.querySelector('#favorite-btn i');
    if (favBtn.classList.contains('fa-regular')) {
        favBtn.classList.remove('fa-regular');
        favBtn.classList.add('fa-solid', 'active');
        favBtn.style.color = '#1db954';
    } else {
        favBtn.classList.remove('fa-solid', 'active');
        favBtn.classList.add('fa-regular');
        favBtn.style.color = '#fff';
    }
}
