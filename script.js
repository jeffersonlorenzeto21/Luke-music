// Lista de músicas com arquivos de áudio públicos e capas ilustrativas
const songs = [
    {
        title: "SoundHelix Song 1",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "https://picsum.photos/200?random=1"
    },
    {
        title: "SoundHelix Song 2",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://picsum.photos/200?random=2"
    },
    {
        title: "SoundHelix Song 3",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://picsum.photos/200?random=3"
    },
    {
        title: "SoundHelix Song 4",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        cover: "https://picsum.photos/200?random=4"
    }
];

const songListContainer = document.getElementById('song-list');
const audioElement = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const searchInput = document.getElementById('search-input');

let isPlaying = false;
let currentSongIndex = null;

// Renderizar músicas na tela (com suporte a filtro de busca)
function renderSongs(songsArray) {
    songListContainer.innerHTML = '';
    
    if (songsArray.length === 0) {
        songListContainer.innerHTML = '<p style="color: #b3b3b3;">Nenhuma música encontrada.</p>';
        return;
    }

    songsArray.forEach((song) => {
        // Encontrar o índice real da música no array original
        const originalIndex = songs.findIndex(s => s.url === song.url);

        const card = document.createElement('div');
        card.classList.add('song-card');
        card.innerHTML = `
            <img src="${song.cover}" alt="Capa">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        `;
        card.addEventListener('click', () => playSong(originalIndex));
        songListContainer.appendChild(card);
    });
}

function playSong(index) {
    currentSongIndex = index;
    const song = songs[index];
    
    audioElement.src = song.url;
    audioElement.play();
    isPlaying = true;
    
    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

// Botão Play/Pause
playBtn.addEventListener('click', () => {
    if (currentSongIndex === null) {
        if (songs.length > 0) playSong(0);
        return;
    }
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        audioElement.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
});

// Próxima música
nextBtn.addEventListener('click', () => {
    if (currentSongIndex === null) return;
    let newIndex = (currentSongIndex + 1) % songs.length;
    playSong(newIndex);
});

// Música anterior
prevBtn.addEventListener('click', () => {
    if (currentSongIndex === null) return;
    let newIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(newIndex);
});

// Avançar automaticamente quando a música acabar
audioElement.addEventListener('ended', () => {
    nextBtn.click();
});

// Evento da barra de pesquisa
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term)
    );
    renderSongs(filteredSongs);
});

// Carga inicial
renderSongs(songs);
