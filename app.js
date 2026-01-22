// Mystery CD Player - Main Application
// App State
let currentCD = null;
let currentTrackIndex = 0;
let isPlaying = false;
let revealedTracks = new Set();
let selectedTracks = [];
let youtubePlayer = null;
let playerReady = false;
let searchCache = [];

// YouTube API Configuration - Built-in for easy deployment
const YOUTUBE_API_KEY = 'AIzaSyBjPBELhlvVchiaO26hyeGt_I_5RcQd8pA';

// Backend API URL - will be set automatically for production
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Detect if YouTube API is blocked
let apiLoadTimeout = setTimeout(() => {
    if (!window.YT || !window.YT.Player) {
        console.warn('YouTube IFrame API failed to load - may be blocked');
    }
}, 5000);

// Initialize YouTube Player when API is ready
window.onYouTubeIframeAPIReady = function() {
    clearTimeout(apiLoadTimeout);
    console.log('YouTube IFrame API loaded successfully');
    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlayer);
    } else {
        initializePlayer();
    }
};

function initializePlayer() {
    try {
        // Make sure the player div exists
        const playerDiv = document.getElementById('player');
        if (!playerDiv) {
            console.error('Player div not found!');
            return;
        }

        youtubePlayer = new YT.Player('player', {
            height: '300',
            width: '100%',
            playerVars: {
                'autoplay': 0,
                'controls': 1,
                'modestbranding': 1,
                'rel': 0,
                'fs': 1,
                'enablejsapi': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    } catch (error) {
        console.error('Error initializing YouTube player:', error);
    }
}

function onPlayerReady(event) {
    playerReady = true;
    console.log('YouTube player ready and initialized');
    // Ensure player is ready to receive commands
    if (youtubePlayer && youtubePlayer.getPlayerState) {
        console.log('Player state:', youtubePlayer.getPlayerState());
    }
}

function onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    let errorMsg = 'VIDEO ERROR';

    if (event.data === 100) {
        errorMsg = 'VIDEO NOT FOUND';
    } else if (event.data === 101 || event.data === 150) {
        errorMsg = 'VIDEO CANNOT BE EMBEDDED\nSKIPPING TO NEXT TRACK...';
        setTimeout(() => {
            nextTrack();
        }, 2000);
    }

    alert(errorMsg);
}

function onPlayerStateChange(event) {
    const cdContainer = document.getElementById('cdContainer');
    const mainContainer = document.getElementById('mainContainer');

    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸️';
        revealedTracks.add(currentTrackIndex);
        updateDisplay();
        startProgressTracking();
        // Start spinning CD and shift UI down
        if (currentCD) {
            const cdText = document.getElementById('cdText');
            cdText.textContent = currentCD.title;
            cdContainer.className = 'cd-container show spinning';
            mainContainer.classList.add('shift-down');
        }
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️';
        stopProgressTracking();
        // Stop spinning CD and hide it
        cdContainer.classList.remove('spinning');
        cdContainer.classList.add('fade-out');
        setTimeout(() => {
            cdContainer.className = 'cd-container';
            mainContainer.classList.remove('shift-down');
        }, 800);
    } else if (event.data === YT.PlayerState.ENDED) {
        cdContainer.classList.remove('spinning');
        cdContainer.classList.add('fade-out');
        setTimeout(() => {
            cdContainer.className = 'cd-container';
            mainContainer.classList.remove('shift-down');
        }, 800);
        nextTrack();
    }
}

// Progress tracking
let progressInterval = null;

function startProgressTracking() {
    stopProgressTracking();
    progressInterval = setInterval(updateProgress, 1000);
}

function stopProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgress() {
    if (youtubePlayer && playerReady) {
        try {
            const duration = youtubePlayer.getDuration();
            const current = youtubePlayer.getCurrentTime();
            const percent = (current / duration) * 100;
            document.getElementById('progressBar').style.width = percent + '%';
        } catch (e) {
            // Player not ready yet
        }
    }
}

// Mode Switching
function switchMode(mode) {
    const playMode = document.getElementById('playMode');
    const createMode = document.getElementById('createMode');
    const buttons = document.querySelectorAll('.mode-selector .mode-btn');
    const cdContainer = document.getElementById('cdContainer');
    const mainContainer = document.getElementById('mainContainer');

    // Hide CD and reset UI when switching modes
    cdContainer.className = 'cd-container';
    mainContainer.classList.remove('shift-down');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (mode === 'play') {
        playMode.style.display = 'block';
        createMode.classList.remove('active');
    } else {
        playMode.style.display = 'none';
        createMode.classList.add('active');
    }
}

// Sparkle effect
function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 80);
    }
}

// Load CD with animation - appears above player
async function loadCD() {
    const code = document.getElementById('cdCodeInput').value.toUpperCase().trim();
    if (!code) {
        alert('PLEASE ENTER A CD CODE!');
        return;
    }

    // Show loading
    document.getElementById('displayText').innerHTML = '<div class="loading">🔍 LOADING CD...</div>';

    let cd;

    // Try localStorage first (faster and works across browser)
    const storedCDs = JSON.parse(localStorage.getItem('mysteryCDs') || '{}');
    cd = storedCDs[code];

    // If not in localStorage, try backend
    if (!cd) {
        try {
            const response = await fetch(`${API_URL}/cd/${code}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.cd) {
                    cd = data.cd;
                    // Save to localStorage for future use
                    storedCDs[code] = cd;
                    localStorage.setItem('mysteryCDs', JSON.stringify(storedCDs));
                }
            }
        } catch (error) {
            console.log('Backend fetch failed:', error);
        }
    }

    if (!cd) {
        alert('CD NOT FOUND! CHECK YOUR CODE.');
        document.getElementById('displayText').innerHTML = 'NO CD LOADED<br><span style="font-size: 18px; opacity: 0.7;">INSERT A CD CODE TO BEGIN</span>';
        return;
    }

    currentCD = cd;
    currentTrackIndex = 0;
    revealedTracks = new Set();
    isPlaying = false;

    // Show CD above player
    const cdContainer = document.getElementById('cdContainer');
    const cdText = document.getElementById('cdText');
    const cdSlot = document.getElementById('cdSlot');
    const mainContainer = document.getElementById('mainContainer');

    // Set CD title with curved text
    cdText.textContent = cd.title;

    // Shift UI down to make room
    mainContainer.classList.add('shift-down');

    // Show CD
    setTimeout(() => {
        cdContainer.className = 'cd-container show';
        cdSlot.classList.add('inserting');
    }, 600);

    // Flash slot
    setTimeout(() => {
        cdSlot.classList.remove('inserting');
    }, 1400);

    // Fade out CD and reset UI
    setTimeout(() => {
        cdContainer.classList.add('fade-out');
    }, 2500);

    setTimeout(() => {
        cdContainer.className = 'cd-container';
        mainContainer.classList.remove('shift-down');
    }, 3300);

    updateDisplay();
    document.getElementById('playBtn').disabled = false;
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('playerContainer').classList.add('active');

    // Wait for player to be ready and load first track
    const tryLoadVideo = () => {
        if (playerReady && youtubePlayer && currentCD.tracks.length > 0) {
            try {
                youtubePlayer.cueVideoById(currentCD.tracks[0].videoId);
                console.log('Loaded video:', currentCD.tracks[0].videoId);
            } catch (e) {
                console.error('Error cueing video:', e);
            }
        } else if (currentCD.tracks.length > 0) {
            setTimeout(tryLoadVideo, 500);
        }
    };
    tryLoadVideo();
}

// Playback Controls
function togglePlay() {
    if (!youtubePlayer || !playerReady) {
        alert('PLAYER NOT READY!\n\nPlease wait a moment and try again.');
        return;
    }

    if (isPlaying) {
        youtubePlayer.pauseVideo();
    } else {
        youtubePlayer.playVideo();
    }
}

function nextTrack() {
    if (!currentCD) return;

    if (currentTrackIndex < currentCD.tracks.length - 1) {
        currentTrackIndex++;
        loadCurrentTrack();
    } else {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️';
        if (youtubePlayer) {
            youtubePlayer.stopVideo();
        }
        stopProgressTracking();
        document.getElementById('progressBar').style.width = '0%';
        alert('END OF CD! 📀');
    }
}

function previousTrack() {
    if (!currentCD) return;

    if (currentTrackIndex > 0) {
        currentTrackIndex--;
        loadCurrentTrack();
    }
}

function loadCurrentTrack() {
    if (!currentCD) return;

    const track = currentCD.tracks[currentTrackIndex];
    updateDisplay();
    document.getElementById('progressBar').style.width = '0%';

    if (!playerReady) return;

    if (isPlaying) {
        youtubePlayer.loadVideoById(track.videoId);
    } else {
        youtubePlayer.cueVideoById(track.videoId);
    }
}

// Update Display
function updateDisplay() {
    const displayText = document.getElementById('displayText');

    if (!currentCD) {
        displayText.innerHTML = 'NO CD LOADED<br><span style="font-size: 18px; opacity: 0.7;">INSERT A CD CODE TO BEGIN</span>';
        return;
    }

    const track = currentCD.tracks[currentTrackIndex];
    const isRevealed = revealedTracks.has(currentTrackIndex);

    let html = `<strong>${escapeHtml(currentCD.title)}</strong><br>`;
    if (currentCD.message) {
        html += `<span style="font-size: 16px; opacity: 0.8;">"${escapeHtml(currentCD.message)}"</span><br>`;
    }
    html += `TRACK ${currentTrackIndex + 1} / ${currentCD.tracks.length}<br><br>`;

    if (isRevealed) {
        html += `<div class="track-info">`;
        html += `🎵 ${escapeHtml(track.title)}<br>`;
        html += `👤 ${escapeHtml(track.channel)}`;
        html += `</div>`;
    } else {
        html += `<div style="font-size: 18px; opacity: 0.7;">`;
        html += `▶️ PRESS PLAY TO REVEAL`;
        html += `</div>`;
    }

    displayText.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search YouTube
async function searchTracks() {
    const query = document.getElementById('trackSearch').value;
    if (!query) {
        alert('ENTER A SEARCH QUERY!');
        return;
    }

    document.getElementById('searchResults').innerHTML = '<div class="loading">🔍 SEARCHING...</div>';

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' music')}&type=video&videoEmbeddable=true&videoCategoryId=10&maxResults=15&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            document.getElementById('searchResults').innerHTML = '<p style="text-align: center; opacity: 0.5;">NO RESULTS FOUND</p>';
            return;
        }

        searchCache = data.items.map((item, index) => ({
            id: 'search_' + Date.now() + '_' + index,
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        displaySearchResults(searchCache);
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('searchResults').innerHTML = '<p style="text-align: center; color: red;">SEARCH FAILED! TRY AGAIN.</p>';
    }
}

function displaySearchResults(tracks) {
    const resultsDiv = document.getElementById('searchResults');

    if (!tracks || tracks.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align: center; opacity: 0.5;">NO RESULTS FOUND</p>';
        return;
    }

    resultsDiv.innerHTML = tracks.map(track => `
        <div class="track-item">
            <div class="track-info-inline">
                <img src="${track.thumbnail}" alt="thumbnail">
                <div class="track-text">
                    <div style="font-weight: bold;">${escapeHtml(track.title)}</div>
                    <div style="font-size: 14px; opacity: 0.7;">${escapeHtml(track.channel)}</div>
                </div>
            </div>
            <button class="add-track" data-track-id="${track.id}">ADD</button>
        </div>
    `).join('');

    document.querySelectorAll('.add-track').forEach(btn => {
        btn.addEventListener('click', function() {
            const trackId = this.getAttribute('data-track-id');
            const track = searchCache.find(t => t.id === trackId);
            if (track) {
                addTrack(track);
            }
        });
    });
}

function addTrack(track) {
    if (selectedTracks.length >= 20) {
        alert('MAX 20 TRACKS PER CD!');
        return;
    }

    if (selectedTracks.find(t => t.videoId === track.videoId)) {
        alert('TRACK ALREADY ADDED!');
        return;
    }

    selectedTracks.push({
        videoId: track.videoId,
        title: track.title,
        channel: track.channel,
        thumbnail: track.thumbnail
    });
    updateSelectedTracks();
}

function removeTrack(index) {
    selectedTracks.splice(index, 1);
    updateSelectedTracks();
}

function updateSelectedTracks() {
    const tracksDiv = document.getElementById('selectedTracks');

    if (selectedTracks.length === 0) {
        tracksDiv.innerHTML = '<p style="text-align: center; opacity: 0.5;">NO TRACKS ADDED YET</p>';
        return;
    }

    tracksDiv.innerHTML = selectedTracks.map((track, index) => `
        <div class="track-item">
            <div class="track-info-inline">
                <img src="${track.thumbnail}" alt="thumbnail">
                <div class="track-text">
                    <div>${index + 1}. ${escapeHtml(track.title)}</div>
                </div>
            </div>
            <button class="remove-track" onclick="removeTrack(${index})">✕</button>
        </div>
    `).join('');
}

async function createCD() {
    const title = document.getElementById('cdTitle').value || 'MYSTERY MIX';
    const message = document.getElementById('cdMessage').value;

    if (selectedTracks.length === 0) {
        alert('ADD SOME TRACKS FIRST!');
        return;
    }

    const code = generateCode();

    // Save to localStorage (works locally and as backup)
    const cdData = {
        title: title,
        message: message,
        tracks: selectedTracks,
        createdAt: new Date().toISOString()
    };

    const storedCDs = JSON.parse(localStorage.getItem('mysteryCDs') || '{}');
    storedCDs[code] = cdData;
    localStorage.setItem('mysteryCDs', JSON.stringify(storedCDs));

    // Try to save to backend (but don't fail if it doesn't work)
    try {
        await fetch(`${API_URL}/cd`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                title: title,
                message: message,
                tracks: selectedTracks
            })
        });
        console.log('CD saved to backend');
    } catch (error) {
        console.log('Backend save failed, using localStorage only:', error);
    }

    // Show CD above player
    const cdContainer = document.getElementById('cdContainer');
    const cdText = document.getElementById('cdText');
    const mainContainer = document.getElementById('mainContainer');

    // Set CD title with curved text
    cdText.textContent = title;

    // Shift UI down to make room
    mainContainer.classList.add('shift-down');

    // Show CD
    setTimeout(() => {
        cdContainer.className = 'cd-container show';
    }, 600);

    // Create sparkles
    setTimeout(() => {
        createSparkles(cdContainer);
    }, 1400);

    // Show share code
    setTimeout(() => {
        document.getElementById('shareCode').textContent = code;
        document.getElementById('shareSection').style.display = 'block';
    }, 1800);

    // Fade out CD and reset UI
    setTimeout(() => {
        cdContainer.classList.add('fade-out');
    }, 2800);

    setTimeout(() => {
        cdContainer.className = 'cd-container';
        mainContainer.classList.remove('shift-down');
    }, 3600);

    // Clear form
    setTimeout(() => {
        document.getElementById('cdTitle').value = '';
        document.getElementById('cdMessage').value = '';
        document.getElementById('trackSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
        selectedTracks = [];
        searchCache = [];
        updateSelectedTracks();
    }, 2500);

    alert('CD CREATED! 💿\n\nYour code is: ' + code + '\n\nShare it with friends!');
}

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}


