let currentAudio = null;
let isPlaying = false;

// Banco de dados local para Gêneros e sugestões rápidas
const musicDatabase = [
    { title: "Leão", artist: "Marília Mendonça", src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/91/92/7e/91927e2b-2f68-7c85-2e6b-0b925b42d76f/mza_10793139360341772186.plus.aac.p.m4a", genre: "Sertanejo", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300" },
    { title: "Bloqueado", artist: "Gusttavo Lima", src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/8a/7e/5e/8a7e5e1a-4286-9a57-19e3-2e06173a1112/mza_11674403756291993414.plus.aac.p.m4a", genre: "Sertanejo", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { title: "Bohemian Rhapsody", artist: "Queen", src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bb/f8/e3/bbf8e392-7489-0c67-628d-19df515ef826/mza_1057865242784539828.plus.aac.p.m4a", genre: "Rock", cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300" },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/71/34/45/713445e9-cf4d-178b-c6cb-841961e967a5/mza_15494481352494191963.plus.aac.p.m4a", genre: "Rock", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300" },
    { title: "Could You Be Loved", artist: "Bob Marley", src: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/c2/70/62/c2706248-cbcc-92c2-8413-5bc09f193798/mza_14562013143524177402.plus.aac.p.m4a", genre: "Reggae", cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300" }
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
                    <div class="song-card" onclick="playSong('${song.src}', '${song.title.replace(/'/g, "")}', '${song.artist.replace(/'/g, "")}')">
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

    if (!audioSrc || audioSrc === "undefined" || audioSrc === "null") {
        alert("Desculpe, esta faixa não possui prévia de áudio disponível.");
        return;
    }

    currentAudio = new Audio(audioSrc);
    currentAudio.play().then(() => {
        isPlaying = true;
        document.querySelector('#play-btn i').className = "fa-solid fa-pause";
    }).catch(error => {
        console.log("Erro de reprodução:", error);
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

// Elementos de Busca e Sugestões em Tempo Real
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

// Cria dinamicamente a caixa de sugestões logo abaixo do input se ela não existir no HTML
let suggestionsBox = document.getElementById('search-suggestions');
if (!suggestionsBox && searchInput) {
    suggestionsBox = document.createElement('div');
    suggestionsBox.id = 'search-suggestions';
    suggestionsBox.style.cssText = `
        position: absolute;
        background: #282828;
        width: 90%;
        max-width: 400px;
        border-radius: 8px;
        margin-top: 5px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: none;
    `;
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(suggestionsBox);
}

// Evento disparado enquanto o usuário digita (Sugestões em tempo real)
if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'block';

                data.results.forEach(song => {
                    const title = song.trackName.replace(/'/g, "");
                    const artist = song.artistName.replace(/'/g, "");
                    const cover = song.artworkUrl100;
                    const preview = song.previewUrl;

                    const item = document.createElement('div');
                    item.style.cssText = `
                        padding: 10px 15px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        cursor: pointer;
                        border-bottom: 1px solid #3e3e3e;
                        color: #fff;
                        font-size: 14px;
                    `;
                    item.innerHTML = `
                        <img src="${cover}" style="width: 35px; height: 35px; border-radius: 4px;">
                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <strong>${title}</strong><br><span style="font-size:12px; color:#b3b3b3;">${artist}</span>
                        </div>
                    `;

                    // Ao clicar na sugestão, toca a música direto e esconde as sugestões
                    item.onclick = () => {
                        playSong(preview, title, artist);
                        suggestionsBox.style.display = 'none';
                        searchInput.value = `${title} - ${artist}`;
                    };

                    suggestionsBox.appendChild(item);
                });
            } else {
                suggestionsBox.style.display = 'none';
            }
        } catch (err) {
            console.log("Erro nas sugestões", err);
        }
    });
}

// Botão de Buscar ou Tecla Enter (Busca Completa)
if (searchBtn) searchBtn.addEventListener('click', performSearch);
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            suggestionsBox.style.display = 'none';
            performSearch();
        }
    });
}

async function performSearch() {
    const query = searchInput.value.trim();
    const listContainer = document.getElementById('song-list');
    
    if (!query || !listContainer) return;

    if (suggestionsBox) suggestionsBox.style.display = 'none';
    listContainer.innerHTML = `<p style="color: #b3b3b3;">Buscando opções para "${query}"...</p>`;

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=30`);
        const data = await response.json();

        listContainer.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            listContainer.innerHTML = `<p style="color: #b3b3b3;">Nenhum resultado encontrado para "${query}".</p>`;
            return;
        }

        data.results.forEach(song => {
            const title = song.trackName ? song.trackName.replace(/'/g, "") : "Música";
            const artist = song.artistName ? song.artistName.replace(/'/g, "") : "Artista";
            const preview = song.previewUrl;
            const cover = song.artworkUrl100 ? song.artworkUrl100.replace('100x100bb', '300x300bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';

            listContainer.innerHTML += `
                <div class="song-card" onclick="playSong('${preview}', '${title}', '${artist}')">
                    <img src="${cover}" alt="${title}">
                    <h4>${title}</h4>
                    <p>${artist}</p>
                </div>
            `;
        });

    } catch (error) {
        listContainer.innerHTML = `<p style="color: #b3b3b3;">Erro ao conectar com a busca. Verifique sua internet.</p>`;
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
