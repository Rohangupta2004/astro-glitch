// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - IN-GAME HYPERFRAMES VIDEO THEATRE PLAYER
// ============================================================================

/**
 * VideoPlayerManager: Embedded theatre player that renders and controls the
 * HeyGen HyperFrames 1920x1080 motion graphics composition directly in-game.
 */
class VideoPlayerManager {
    constructor() {
        this.isOpen = false;
        this.isPlaying = true;
        this.currentTime = 0;
        this.totalDuration = 60; // 60s composition
        this.iframe = null;
        this.timelineInterval = null;

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        let modal = document.getElementById('videoTheatreModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'videoTheatreModal';
            modal.className = 'video-theatre-modal hidden';
            modal.innerHTML = `
                <div class="video-theatre-card">
                    <!-- Top Bar -->
                    <div class="video-top-bar">
                        <div class="video-meta-left">
                            <span class="video-tag-badge">HEYGEN HYPERFRAMES // 1080P 60FPS</span>
                            <h3 class="video-title">MISSION BRIEFING & STORY TRAILER</h3>
                        </div>
                        <div class="video-chapter-pills">
                            <button id="btnChapterFull" class="video-chapter-btn active" data-time="0">🎬 FULL (60s)</button>
                            <button id="btnChapterStory" class="video-chapter-btn" data-time="0">📖 STORY (0-26s)</button>
                            <button id="btnChapterGuide" class="video-chapter-btn" data-time="26">🎮 HOW TO PLAY (26-60s)</button>
                            <button id="btnVideoClose" class="video-btn-close">✕ CLOSE [ESC]</button>
                        </div>
                    </div>

                    <!-- 16:9 Motion Graphics Viewport -->
                    <div class="video-viewport-wrapper">
                        <iframe 
                            id="hyperframesIframe" 
                            class="video-iframe" 
                            src="./hyperframes-video/index.html?autoplay=1" 
                            allow="autoplay"
                        ></iframe>
                    </div>

                    <!-- Bottom Controls Bar -->
                    <div class="video-controls-bar">
                        <div class="video-ctrl-left">
                            <button id="btnPlayPause" class="video-btn-play" title="Play / Pause [SPACE]">⏸️ PAUSE</button>
                            <button id="btnReplay" class="video-btn-sub" title="Replay">🔄 REPLAY</button>
                            <span id="videoTimeDisplay" class="video-time-txt">00:00 / 01:00</span>
                        </div>

                        <!-- Scrubber Bar -->
                        <div class="video-scrubber-box">
                            <input type="range" id="videoScrubber" min="0" max="60" step="0.1" value="0" class="video-range-slider">
                        </div>

                        <div class="video-ctrl-right">
                            <button id="btnLaunchGame" class="video-btn-deploy">PLAY HEIST NOW ▶</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        this.iframe = document.getElementById('hyperframesIframe');
        if (this.iframe) {
            this.iframe.addEventListener('load', () => {
                this.fitIframe();
            });
        }
    }

    fitIframe() {
        try {
            if (this.iframe && this.iframe.contentWindow) {
                if (typeof this.iframe.contentWindow.fitCompositionToViewport === 'function') {
                    this.iframe.contentWindow.fitCompositionToViewport();
                }
            }
        } catch (e) {}
    }

    bindEvents() {
        const modal = document.getElementById('videoTheatreModal');
        const btnClose = document.getElementById('btnVideoClose');
        const btnPlayPause = document.getElementById('btnPlayPause');
        const btnReplay = document.getElementById('btnReplay');
        const btnLaunchGame = document.getElementById('btnLaunchGame');
        const scrubber = document.getElementById('videoScrubber');

        if (btnClose) btnClose.addEventListener('click', () => this.close());
        if (btnLaunchGame) btnLaunchGame.addEventListener('click', () => this.close());

        if (btnPlayPause) {
            btnPlayPause.addEventListener('click', () => this.togglePlayPause());
        }

        if (btnReplay) {
            btnReplay.addEventListener('click', () => {
                this.seekTo(0);
                this.play();
            });
        }

        if (scrubber) {
            scrubber.addEventListener('input', (e) => {
                const targetTime = parseFloat(e.target.value);
                this.seekTo(targetTime);
            });
        }

        // Chapter buttons
        const chapterBtns = document.querySelectorAll('.video-chapter-btn');
        chapterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chapterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const t = parseFloat(btn.dataset.time);
                this.seekTo(t);
                this.play();
            });
        });

        // Global Keydown
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyV' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Prevent typing into form elements
                if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
                e.preventDefault();
                this.toggle();
            }

            if (this.isOpen) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.close();
                }
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.togglePlayPause();
                }
            }
        });

        // Window resize re-scaling
        window.addEventListener('resize', () => {
            if (this.isOpen) {
                this.fitIframe();
            }
        });
    }

    open(initialTime = 0) {
        this.isOpen = true;
        const modal = document.getElementById('videoTheatreModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }

        // Ensure the HyperFrames iframe scales properly to the viewport
        this.fitIframe();
        setTimeout(() => this.fitIframe(), 50);
        setTimeout(() => this.fitIframe(), 150);
        setTimeout(() => this.fitIframe(), 350);

        if (initialTime > 0) {
            setTimeout(() => this.seekTo(initialTime), 300);
        }

        this.startSyncLoop();

        if (window.soundManager) {
            window.soundManager.playComicStinger();
        }
    }

    close() {
        this.isOpen = false;
        const modal = document.getElementById('videoTheatreModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        }

        this.pause();
        clearInterval(this.timelineInterval);

        if (window.soundManager) {
            window.soundManager.playClick();
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open(0);
        }
    }

    play() {
        this.isPlaying = true;
        this.sendIframeCommand('play');
        const btn = document.getElementById('btnPlayPause');
        if (btn) btn.innerHTML = '⏸️ PAUSE';
    }

    pause() {
        this.isPlaying = false;
        this.sendIframeCommand('pause');
        const btn = document.getElementById('btnPlayPause');
        if (btn) btn.innerHTML = '▶️ PLAY';
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    seekTo(seconds) {
        this.currentTime = seconds;
        this.sendIframeCommand('seek', seconds);
        const scrubber = document.getElementById('videoScrubber');
        if (scrubber) scrubber.value = seconds;
        this.updateTimeDisplay(seconds);
    }

    sendIframeCommand(action, arg = null) {
        if (!this.iframe || !this.iframe.contentWindow) return;
        try {
            const player = this.iframe.contentWindow.hyperframesPlayer;
            if (player) {
                if (action === 'play') player.play();
                if (action === 'pause') player.pause();
                if (action === 'seek') player.seek(arg);
                if (action === 'restart') player.restart();
            }
        } catch (e) {
            // In case of iframe sandbox timing
        }
    }

    startSyncLoop() {
        clearInterval(this.timelineInterval);
        this.timelineInterval = setInterval(() => {
            if (!this.isOpen || !this.iframe || !this.iframe.contentWindow) return;
            try {
                const player = this.iframe.contentWindow.hyperframesPlayer;
                if (player) {
                    const curTime = player.getCurrentTime();
                    this.currentTime = curTime;
                    const scrubber = document.getElementById('videoScrubber');
                    if (scrubber && document.activeElement !== scrubber) {
                        scrubber.value = curTime;
                    }
                    this.updateTimeDisplay(curTime);

                    // Update active chapter badge
                    const btnStory = document.getElementById('btnChapterStory');
                    const btnGuide = document.getElementById('btnChapterGuide');
                    if (curTime < 26) {
                        if (btnStory) btnStory.classList.add('active');
                        if (btnGuide) btnGuide.classList.remove('active');
                    } else {
                        if (btnGuide) btnGuide.classList.add('active');
                        if (btnStory) btnStory.classList.remove('active');
                    }
                }
            } catch (e) {}
        }, 100);
    }

    updateTimeDisplay(time) {
        const display = document.getElementById('videoTimeDisplay');
        if (!display) return;
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} / 01:00`;
    }
}

// Global Export & Auto-Instantiation
if (typeof window !== 'undefined') {
    window.VideoPlayerManager = VideoPlayerManager;
    window.videoPlayer = new VideoPlayerManager();
}
