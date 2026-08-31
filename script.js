=========================================================
   LUKE MUSIC — script.js
   Reescrito a partir da base do Gemini. Principais mudanças:
   - As URLs de áudio fixas do banco local antigo (hashes da CDN
     da Apple) ficam inválidas rapidamente e não devem ser usadas
     como fonte fixa; agora TUDO vem ao vivo da iTunes Search API,
     inclusive os cartões de gênero na Home.
   - Player de verdade: fila, próxima/anterior, aleatório, repetir,
     barra de progresso arrastável, volume, Media Session (controles
     na tela de bloqueio).
   - Busca com debounce (evita 1 request por tecla) + cancelamento
     de respostas antigas fora de ordem.
   - Favoritos e "continuar ouvindo" persistidos com localStorage,
     com fallback em memória se o storage não estiver disponível
     (ex.: preview dentro de um iframe restrito).
   - Sem alert(): erros e avisos aparecem num toast discreto.
   ========================================================= */

(() => {
  'use strict';

  const ITUNES_SEARCH = 'https://itunes.apple.com/search';
  const DEBOUNCE_MS = 320;
  const FALLBACK_COVER = 'icons/icon-192.png';

  /* ---------------------------------------------------------
     Armazenamento local seguro (com fallback em memória)
  --------------------------------------------------------- */
  const memoryStore = {};
  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return key in memoryStore ? memoryStore[key] : fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        memoryStore[key] = value;
      }
    }
  };

  /* ---------------------------------------------------------
     Gêneros em destaque na Home (cartões estilo "grade")
  --------------------------------------------------------- */
  const GENRES = [
    { name: 'Sertanejo',  term: 'sertanejo',        icon: 'fa-hat-cowboy',      a: '#C97C3D', b: '#5A2E10' },
    { name: 'Rock',       term: 'rock',             icon: 'fa-guitar',         a: '#D94141', b: '#4A0D12' },
    { name: 'Pop',        term: 'pop hits',         icon: 'fa-star',           a: '#D74BA0', b: '#4A0F3A' },
    { name: 'Reggae',     term: 'reggae',           icon: 'fa-sun',            a: '#C7A233', b: '#4A3B0B' },
    { name: 'Eletrônica', term: 'eletronica',       icon: 'fa-bolt',           a: '#4B6FD9', b: '#101636' },
    { name: 'Gospel',     term: 'gospel',           icon: 'fa-dove',           a: '#2FA894', b: '#0A362F' },
    { name: 'Forró',      term: 'forro',            icon: 'fa-music',         a: '#E0713A', b: '#5C260C' },
    { name: 'Funk',       term: 'funk brasil',      icon: 'fa-record-vinyl',  a: '#8A4FD9', b: '#2A0F4A' },
  ];

  /* ---------------------------------------------------------
     Estado do player
  --------------------------------------------------------- */
  const audio = new Audio();
  audio.preload = 'metadata';

  const state = {
    queue: [],       // lista de faixas atualmente navegável
    index: -1,       // posição da faixa atual dentro da queue
    shuffle: false,
    repeat: false,   // repetir a faixa atual
    favorites: storage.get('luke_favorites', []),   // array de trackId
    recent: storage.get('luke_recent', []),         // últimas faixas tocadas
  };

  /* ---------------------------------------------------------
     Referências de elementos
  --------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    greeting: $('#greeting-text'),
    genreGrid: $('#genre-grid'),
    chips: $('#mood-chips'),
    railRecent: $('#rail-recent'),
    railRecentTrack: $('#rail-recent-track'),

    searchInput: $('#search-input'),
    searchClear: $('#search-clear'),
    suggestions: $('#search-suggestions'),
    searchStatus: $('#search-status'),
    songList: $('#song-list'),

    genreBackBtn: $('#genre-back-btn'),
    genreTitle: $('#genre-title-screen'),
    genreStatus: $('#genre-status'),
    genreSongList: $('#genre-song-list'),

    libraryStatus: $('#library-status'),
    libraryList: $('#library-list'),

    miniPlayer: $('#mini-player'),
    miniCover: $('#mini-cover'),
    miniTitle: $('#current-title'),
    miniArtist: $('#current-artist'),
    miniPlayIcon: $('#mini-play-icon'),
    miniFavorite: $('#mini-favorite'),
    miniProgressFill: $('#mini-progress-fill'),

    playerCover: $('#player-cover'),
    playerTitleFull: $('#player-title-full'),
    playerArtistFull: $('#player-artist-full'),
    favoriteBtn: $('#favorite-btn'),
    progressBar: $('#progress-bar'),
    timeCurrent: $('#time-current'),
    timeDuration: $('#time-duration'),
    playBtn: $('#play-btn'),
    prevBtn: $('#prev-btn'),
    nextBtn: $('#next-btn'),
    shuffleBtn: $('#shuffle-btn'),
    repeatBtn: $('#repeat-btn'),
    volumeBar: $('#volume-bar'),
    playerCollapseBtn: $('#player-collapse-btn'),

    toast: $('#toast'),
  };

  let toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2600);
  }

  /* ---------------------------------------------------------
     Navegação entre telas
  --------------------------------------------------------- */
  let lastNonPlayerScreen = 'home';

  function switchScreen(screenId) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screenId}`);
    if (target) target.classList.add('active');

    $$('.nav-item').forEach((n) => n.classList.toggle('is-active', n.dataset.screen === screenId));

    if (screenId !== 'player') lastNonPlayerScreen = screenId;
  }

  $$('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
  });

  els.genreBackBtn.addEventListener('click', () => switchScreen('home'));
  els.playerCollapseBtn.addEventListener('click', () => switchScreen(lastNonPlayerScreen));
  els.miniPlayer.addEventListener('click', () => switchScreen('player'));

  /* ---------------------------------------------------------
     Saudação dinâmica
  --------------------------------------------------------- */
  function setGreeting() {
    const h = new Date().getHours();
    els.greeting.textContent = h < 5 ? 'Boa madrugada'
      : h < 12 ? 'Bom dia'
      : h < 18 ? 'Boa tarde'
      : 'Boa noite';
  }
  setGreeting();

  /* ---------------------------------------------------------
     Home: grade de gêneros
  --------------------------------------------------------- */
  function renderGenreGrid() {
    els.genreGrid.innerHTML = GENRES.map((g) => `
      <button class="genre-tile" style="--tile-a:${g.a}; --tile-b:${g.b}" data-term="${g.term}" data-name="${g.name}">
        <i class="fa-solid ${g.icon} tile-icon"></i>
        <span>${g.name}</span>
      </button>
    `).join('');
  }
  renderGenreGrid();

  els.genreGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.genre-tile');
    if (!btn) return;
    openGenre(btn.dataset.name, btn.dataset.term);
  });

  els.chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', els.chips).forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const term = chip.dataset.genre;
    if (term) {
      openGenre(chip.textContent.trim(), term.toLowerCase());
    } else {
      switchScreen('home');
    }
  });

  /* ---------------------------------------------------------
     iTunes Search API — normalização de resultados
  --------------------------------------------------------- */
  function normalizeTrack(raw) {
    return {
      id: raw.trackId,
      title: raw.trackName || 'Faixa desconhecida',
      artist: raw.artistName || 'Artista desconhecido',
      album: raw.collectionName || '',
      preview: raw.previewUrl || null,
      cover: raw.artworkUrl100 ? raw.artworkUrl100.replace('100x100bb', '300x300bb') : FALLBACK_COVER,
      duration: raw.trackTimeMillis ? Math.round(raw.trackTimeMillis / 1000) : null,
    };
  }

  async function searchTracks(term, limit = 25) {
    const url = `${ITUNES_SEARCH}?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}&country=BR`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha na resposta da API');
    const data = await res.json();
    return (data.results || [])
      .filter((r) => r.previewUrl)
      .map(normalizeTrack);
  }

  /* ---------------------------------------------------------
     Renderização de linhas/cartões de música
  --------------------------------------------------------- */
  function songRowHTML(track, idx) {
    const isFav = state.favorites.includes(track.id);
    return `
      <div class="song-row" data-idx="${idx}" role="button" tabindex="0">
        <img src="${track.cover}" alt="" loading="lazy">
        <div class="song-row-text">
          <strong>${escapeHTML(track.title)}</strong>
          <span>${escapeHTML(track.artist)}</span>
        </div>
        <i class="row-heart ${isFav ? 'fa-solid is-fav' : 'fa-regular'} fa-heart" data-fav-id="${track.id}"></i>
      </div>
    `;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function bindSongList(container, tracks) {
    container.innerHTML = tracks.map((t, i) => songRowHTML(t, i)).join('');
    container.querySelectorAll('.song-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-heart')) return; // tratado à parte
        const idx = Number(row.dataset.idx);
        playFromQueue(tracks, idx);
      });
    });
    container.querySelectorAll('.row-heart').forEach((heart) => {
      heart.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavoriteById(Number(heart.dataset.favId), tracks);
      });
    });
  }

  /* ---------------------------------------------------------
     Tela de gênero
  --------------------------------------------------------- */
  async function openGenre(name, term) {
    els.genreTitle.textContent = name;
    switchScreen('genre');
    els.genreSongList.innerHTML = '';
    els.genreStatus.hidden = false;
    els.genreStatus.classList.remove('is-error');
    els.genreStatus.textContent = `Carregando ${name}...`;

    try {
      const tracks = await searchTracks(term, 25);
      if (!tracks.length) {
        els.genreStatus.textContent = `Nenhuma prévia disponível para ${name} agora.`;
        return;
      }
      els.genreStatus.hidden = true;
      bindSongList(els.genreSongList, tracks);
    } catch (err) {
      console.error(err);
      els.genreStatus.hidden = false;
      els.genreStatus.classList.add('is-error');
      els.genreStatus.textContent = 'Não deu para carregar agora. Verifique sua internet e tente de novo.';
    }
  }

  /* ---------------------------------------------------------
     Busca com debounce + sugestões
  --------------------------------------------------------- */
  let debounceTimer = null;
  let searchSeq = 0;

  els.searchInput.addEventListener('input', () => {
    const query = els.searchInput.value.trim();
    els.searchClear.hidden = query.length === 0;

    clearTimeout(debounceTimer);
    if (query.length < 2) {
      closeSuggestions();
      return;
    }
    debounceTimer = setTimeout(() => fetchSuggestions(query), DEBOUNCE_MS);
  });

  els.searchClear.addEventListener('click', () => {
    els.searchInput.value = '';
    els.searchClear.hidden = true;
    closeSuggestions();
    els.searchInput.focus();
  });

  els.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      closeSuggestions();
      performSearch(els.searchInput.value.trim());
    }
  });

  document.addEventListener('click', (e) => {
    if (!els.suggestions.contains(e.target) && e.target !== els.searchInput) {
      closeSuggestions();
    }
  });

  function closeSuggestions() {
    els.suggestions.classList.remove('is-open');
    els.suggestions.innerHTML = '';
  }

  async function fetchSuggestions(query) {
    const seq = ++searchSeq;
    try {
      const tracks = await searchTracks(query, 6);
      if (seq !== searchSeq) return; // resposta antiga, ignorar
      if (!tracks.length) { closeSuggestions(); return; }

      els.suggestions.innerHTML = tracks.map((t, i) => `
        <div class="suggestion-item" data-idx="${i}">
          <img src="${t.cover}" alt="">
          <div class="suggestion-text">
            <strong>${escapeHTML(t.title)}</strong>
            <span>${escapeHTML(t.artist)}</span>
          </div>
        </div>
      `).join('');
      els.suggestions.classList.add('is-open');

      els.suggestions.querySelectorAll('.suggestion-item').forEach((item) => {
        item.addEventListener('click', () => {
          const t = tracks[Number(item.dataset.idx)];
          els.searchInput.value = `${t.title} - ${t.artist}`;
          closeSuggestions();
          playFromQueue(tracks, Number(item.dataset.idx));
        });
      });
    } catch (err) {
      console.error('Erro nas sugestões', err);
    }
  }

  async function performSearch(query) {
    if (!query) return;
    els.songList.innerHTML = '';
    els.searchStatus.hidden = false;
    els.searchStatus.classList.remove('is-error');
    els.searchStatus.textContent = `Buscando "${query}"...`;

    try {
      const tracks = await searchTracks(query, 30);
      if (!tracks.length) {
        els.searchStatus.textContent = `Nenhum resultado com prévia para "${query}".`;
        return;
      }
      els.searchStatus.hidden = true;
      bindSongList(els.songList, tracks);
    } catch (err) {
      console.error(err);
      els.searchStatus.hidden = false;
      els.searchStatus.classList.add('is-error');
      els.searchStatus.textContent = 'Erro ao conectar. Verifique sua internet.';
    }
  }

  /* ---------------------------------------------------------
     Biblioteca / Favoritos
     Guardamos os objetos completos das faixas favoritadas para
     não depender de uma nova busca para tocá-las de novo.
  --------------------------------------------------------- */
  let favoriteTracks = storage.get('luke_favorite_tracks', []);

  function renderLibrary() {
    if (!favoriteTracks.length) {
      els.libraryStatus.hidden = false;
      els.libraryList.innerHTML = '';
      return;
    }
    els.libraryStatus.hidden = true;
    bindSongList(els.libraryList, favoriteTracks);
  }

  function toggleFavoriteById(trackId, sourceTracks) {
    const already = state.favorites.includes(trackId);
    if (already) {
      state.favorites = state.favorites.filter((id) => id !== trackId);
      favoriteTracks = favoriteTracks.filter((t) => t.id !== trackId);
    } else {
      const track = sourceTracks.find((t) => t.id === trackId);
      if (track) {
        state.favorites.push(trackId);
        favoriteTracks.push(track);
      }
    }
    storage.set('luke_favorites', state.favorites);
    storage.set('luke_favorite_tracks', favoriteTracks);

    // Atualiza corações visíveis nas telas abertas
    $$(`.row-heart[data-fav-id="${trackId}"]`).forEach((h) => {
      h.classList.toggle('is-fav', !already);
      h.classList.toggle('fa-solid', !already);
      h.classList.toggle('fa-regular', already);
    });
    if (currentTrack() && currentTrack().id === trackId) {
      updatePlayerFavoriteIcon();
    }
    if (document.getElementById('screen-library').classList.contains('active')) {
      renderLibrary();
    }
  }

  function updatePlayerFavoriteIcon() {
    const t = currentTrack();
    const isFav = t && state.favorites.includes(t.id);
    els.favoriteBtn.classList.toggle('is-fav', !!isFav);
    els.favoriteBtn.querySelector('i').className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    els.miniFavorite.className = `fa-heart ${isFav ? 'fa-solid' : 'fa-regular'}`;
  }

  els.favoriteBtn.addEventListener('click', () => {
    const t = currentTrack();
    if (!t) return;
    toggleFavoriteById(t.id, [t]);
  });

  /* ---------------------------------------------------------
     "Continuar ouvindo"
  --------------------------------------------------------- */
  function pushRecent(track) {
    state.recent = [track, ...state.recent.filter((t) => t.id !== track.id)].slice(0, 12);
    storage.set('luke_recent', state.recent);
    renderRecentRail();
  }

  function renderRecentRail() {
    if (!state.recent.length) {
      els.railRecent.hidden = true;
      return;
    }
    els.railRecent.hidden = false;
    els.railRecentTrack.innerHTML = state.recent.map((t, i) => `
      <div class="song-card" data-idx="${i}" role="button" tabindex="0">
        <img src="${t.cover}" alt="" loading="lazy">
        <h4>${escapeHTML(t.title)}</h4>
        <p>${escapeHTML(t.artist)}</p>
      </div>
    `).join('');
    els.railRecentTrack.querySelectorAll('.song-card').forEach((card) => {
      card.addEventListener('click', () => playFromQueue(state.recent, Number(card.dataset.idx)));
    });
  }

  /* ---------------------------------------------------------
     Motor de reprodução
  --------------------------------------------------------- */
  function currentTrack() {
    return state.index >= 0 ? state.queue[state.index] : null;
  }

  function playFromQueue(tracks, startIndex) {
    state.queue = tracks;
    state.index = startIndex;
    playCurrent();
  }

  function playCurrent() {
    const track = currentTrack();
    if (!track) return;

    if (!track.preview) {
      showToast('Essa faixa não tem prévia de áudio disponível.');
      return;
    }

    audio.src = track.preview;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.log('Erro de reprodução:', err);
      showToast('Não foi possível tocar essa faixa.');
    });

    renderNowPlaying(track);
    pushRecent(track);
    updateMediaSession(track);
  }

  function renderNowPlaying(track) {
    els.miniPlayer.hidden = false;
    els.miniCover.src = track.cover;
    els.miniTitle.textContent = track.title;
    els.miniArtist.textContent = track.artist;

    els.playerCover.src = track.cover;
    els.playerTitleFull.textContent = track.title;
    els.playerArtistFull.textContent = track.artist;

    updatePlayerFavoriteIcon();
  }

  function setPlayingUI(isPlaying) {
    els.playBtn.innerHTML = `<i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
    els.miniPlayIcon.className = `fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`;
  }

  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    els.progressBar.value = pct;
    els.miniProgressFill.style.width = `${pct}%`;
    els.timeCurrent.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    els.timeDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (state.repeat) {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    goNext();
  });

  function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function togglePlayPause() {
    if (!currentTrack()) {
      showToast('Escolha uma música para começar.');
      return;
    }
    if (audio.paused) audio.play(); else audio.pause();
  }

  function goNext() {
    if (!state.queue.length) return;
    let next;
    if (state.shuffle) {
      next = Math.floor(Math.random() * state.queue.length);
    } else {
      next = state.index + 1;
      if (next >= state.queue.length) next = 0;
    }
    state.index = next;
    playCurrent();
  }

  function goPrev() {
    if (!state.queue.length) return;
    // se já tocou mais de 3s, volta para o início da faixa em vez de pular
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prev = state.index - 1;
    if (prev < 0) prev = state.queue.length - 1;
    state.index = prev;
    playCurrent();
  }

  els.playBtn.addEventListener('click', togglePlayPause);
  els.nextBtn.addEventListener('click', goNext);
  els.prevBtn.addEventListener('click', goPrev);

  els.shuffleBtn.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    els.shuffleBtn.classList.toggle('is-active', state.shuffle);
  });
  els.repeatBtn.addEventListener('click', () => {
    state.repeat = !state.repeat;
    els.repeatBtn.classList.toggle('is-active', state.repeat);
  });

  els.progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (els.progressBar.value / 100) * audio.duration;
  });

  els.volumeBar.addEventListener('input', () => {
    audio.volume = Number(els.volumeBar.value);
  });

  /* ---------------------------------------------------------
     Media Session — controles na tela de bloqueio / fones
  --------------------------------------------------------- */
  function updateMediaSession(track) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'Luke Music',
      artwork: [{ src: track.cover, sizes: '300x300', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', goPrev);
    navigator.mediaSession.setActionHandler('nexttrack', goNext);
  }

  /* ---------------------------------------------------------
     Inicialização
  --------------------------------------------------------- */
  renderRecentRail();
  renderLibrary();
  switchScreen('home');

  /* ---------------------------------------------------------
     Service worker (funciona offline / instalável)
  --------------------------------------------------------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.log('Falha ao registrar service worker:', err);
      });
    });
  }
})();
