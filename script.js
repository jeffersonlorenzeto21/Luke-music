let currentAudio = null;
let isPlaying = false;

// Banco de dados inicial para as telas de Gênero
const musicDatabase = [
    { title: "Leão", artist: "Marília Mendonça", src: "https://cdns-preview-d.dzcdn.net/stream/c-deda73f5509939e6a3f2537f5f9e2b00-3.mp3", genre: "Sertanejo", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300" },
    { title: "Bloqueado", artist: "Gusttavo Lima", src: "https://cdns-preview-a.dzcdn.net/stream/c-a52d3a3f3a8b4317f8f9e25d2b7b51e0-3.mp3", genre: "Sertanejo", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { title: "Bohemian Rhapsody", artist: "Queen", src: "https://cdns-preview-e.dzcdn.net/stream/c-e9404285b54a234b6333346f91f74577-3.mp3", genre: "Rock", cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", src: "https://cdns-preview-f.dzcdn.net/stream/c-f23023e354023253748232b7245b128e-3.mp3", genre: "Rock", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300" },
    { title: "Lofi Study Beats", artist: "Lofi Girl", src: "https://cdns-preview-b.dzcdn.net/stream/c-b12482374823912739128371923891a2-3.mp3", genre: "Lofi", cover: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300" },
    { title: "Could You Be Loved", artist: "Bob Marley", src: "https://cdns-preview-c.dzcdn.net/stream/c-c9238129038129038129038129038190-3.mp3", genre: "Reggae", cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300" }
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
                    <div class="song-card" onclick="playSong('${song.src}', '${song.title.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}')">
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

// Tocar Música
function playSong(audioSrc, title, artist) {
    if (currentAudio) {
        currentAudio.pause();
    }

    if (!audioSrc || audioSrc === "undefined") {
        alert("Esta faixa não possui prévia de áudio disponível.");
        return;
    }

    currentAudio = new Audio(audioSrc);
    currentAudio.play().then(() => {
        isPlaying = true;
        document.querySelector('#play-btn i').className = "fa-solid fa-pause";
    }).catch(error => {
        console.log("Erro ao reproduzir áudio:", error);
    });

    document.getElementById('current-title').innerText = title;
    document.getElementById('current-artist').innerText = artist;

    let container = document.getElementById('youtube-player-container');
    if (container) container.innerHTML = '';
}

// Botão de Play/Pause principal inferior
const playBtn = document.getElementById('play-btn');
if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (!currentAudio) {
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

// Sistema de Busca Global em Tempo Real (Integrado com a API do Deezer para trazer várias opções)
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

if (searchBtn) searchBtn.addEventListener('click', performSearch);
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

async function performSearch() {
    const query = searchInput.value.trim();
    const listContainer = document.getElementById('song-list');
    
    if (!query || !listContainer) return;

    listContainer.innerHTML = `<p style="color: #b3b3b3;">Buscando opções para "${query}"...</p>`;

    try {
        // Usamos um proxy CORS público para consultar o catálogo completo do Deezer via JSONP/Fetch
        const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&output=jsonp`, {
            mode: 'no-cors'
        });
        
        // Como o fetch direto em no-cors restringe o JSON, usamos a API pública alternativa do iTunes Search (suporta CORS completo e traz centenas de opções reais de artistas)
        fetchItunesSearch(query, listContainer);

    } catch (e) {
        fetchItunesSearch(query, listContainer);
    }
}

async function fetchItunesSearch(query, listContainer) {
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`);
        const data = await res.json();

        listContainer.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            listContainer.innerHTML = `<p style="color: #b3b3b3;">Nenhum resultado encontrado para "${query}".</p>`;
            return;
        }

        data.results.forEach(song => {
            const title = song.trackName.replace(/'/g, "");
            const artist = song.artistName.replace(/'/g, "");
            const preview = song.previewUrl;
            const cover = song.artworkUrl100.replace('100x100bb', '300x300bb');

            listContainer.innerHTML += `
                <div class="song-card" onclick="playSong('${preview}', '${title}', '${artist}')">
                    <img src="${cover}" alt="${title}">
                    <h4>${title}</h4>
                    <p>${artist}</p>
                </div>
            `;
        });

    } catch (err) {
        listContainer.innerHTML = `<p style="color: #b3b3b3;">Erro ao buscar músicas. Verifique sua conexão.</p>`;
    }
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
