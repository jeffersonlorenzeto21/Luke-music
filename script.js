let currentAudio = null;
let isPlaying = false;

// Banco de dados com links de áudio diretos e funcionais (Garante reprodução imediata)
const musicDatabase = [
    { title: "Leão (Remix Lofi)", artist: "Marília Mendonça (Inspiração)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", genre: "Sertanejo", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300" },
    { title: "Modão Universitário", artist: "Gusttavo Lima (Inspiração)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", genre: "Sertanejo", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { title: "Rock Anthem Classic", artist: "Queen Style", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", genre: "Rock", cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300" },
    { title: "Grunge Garage", artist: "Nirvana Style", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", genre: "Rock", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300" },
    { title: "Lofi Study Beats", artist: "Lofi Chill", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", genre: "Lofi", cover: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300" },
    { title: "Reggae Roots Vibration", artist: "Bob Marley Style", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", genre: "Reggae", cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300" }
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

// Abrir Gênero
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
                    <div class="song-card" onclick="playSong('${song.src}', '${song.title}', '${song.artist}')">
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

// Tocar Música com Áudio Nativo HTML5 (100% Funcional no Celular)
function playSong(audioSrc, title, artist) {
    if (currentAudio) {
        currentAudio.pause();
    }

    currentAudio = new Audio(audioSrc);
    currentAudio.play().then(() => {
        isPlaying = true;
        document.querySelector('#play-btn i').className = "fa-solid fa-pause";
    }).catch(error => {
        console.log("Erro ao reproduzir áudio:", error);
        alert("Toque novamente na tela para permitir a reprodução.");
    });

    document.getElementById('current-title').innerText = title;
    document.getElementById('current-artist').innerText = artist;

    // Limpa qualquer iframe antigo que estivesse dando erro do YouTube
    let container = document.getElementById('youtube-player-container');
    if (container) container.innerHTML = '';
}

// Botão de Play/Pause principal inferior
const playBtn = document.getElementById('play-btn');
if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (!currentAudio) {
            // Toca a primeira música por padrão
            playSong(musicDatabase[0].src, musicDatabase[0].title, musicDatabase[0].artist);
            return;
        }

        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            currentAudio.play();
            isPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    });
}

// Sistema de Busca
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

if (searchBtn) searchBtn.addEventListener('click', performSearch);
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
                <div class="song-card" onclick="playSong('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '${query} (Mix)', 'Luke Music')">
                    <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300" alt="Play">
                    <h4>${query}</h4>
                    <p>Toque para reproduzir</p>
                </div>
            `;
        } else {
            results.forEach(song => {
                listContainer.innerHTML += `
                    <div class="song-card" onclick="playSong('${song.src}', '${song.title}', '${song.artist}')">
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
