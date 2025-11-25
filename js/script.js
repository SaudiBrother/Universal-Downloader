/**
 * UNIVERSAL DOWNLOADER LOGIC "PERFECTED"
 * Includes: Auto-detection, LocalStorage History, Mock API handling
 */

class DownloaderApp {
    constructor() {
        this.state = {
            isLoading: false,
            currentPlatform: 'default',
            autoDetect: true,
            history: JSON.parse(localStorage.getItem('dl_history')) || []
        };

        this.dom = {
            input: document.getElementById('url-input'),
            fetchBtn: document.getElementById('fetch-btn'),
            pasteBtn: document.getElementById('paste-btn'),
            platformSelect: document.getElementById('platform-select'),
            resultsGrid: document.getElementById('results-grid'),
            overlay: document.getElementById('loading-overlay'),
            overlayText: document.getElementById('loading-text'),
            brandIcon: document.getElementById('brand-icon'),
            template: document.getElementById('card-template'),
            menuBtn: document.getElementById('menu-btn'),
            sidebar: document.getElementById('sidebar'),
            backdrop: document.getElementById('mobile-backdrop'),
            historyContainer: document.getElementById('history-container'),
            clearHistoryBtn: document.getElementById('clear-history'),
            clearResultsBtn: document.getElementById('clear-results')
        };

        this.platformConfig = {
            'youtube': { theme: 'theme-youtube', icon: 'fa-brands fa-youtube', regex: /youtube\.com|youtu\.be/ },
            'tiktok': { theme: 'theme-tiktok', icon: 'fa-brands fa-tiktok', regex: /tiktok\.com/ },
            'instagram': { theme: 'theme-instagram', icon: 'fa-brands fa-instagram', regex: /instagram\.com/ },
            'facebook': { theme: 'theme-facebook', icon: 'fa-brands fa-facebook', regex: /facebook\.com|fb\.watch/ },
            'twitter': { theme: 'theme-x', icon: 'fa-brands fa-x-twitter', regex: /twitter\.com|x\.com/ },
            'default': { theme: 'theme-default', icon: 'fa-solid fa-bolt', regex: null }
        };
    }

    init() {
        this.bindEvents();
        this.renderHistory();
        
        // Entrance Animation
        setTimeout(() => document.body.style.opacity = '1', 100);
    }

    bindEvents() {
        // Input Handling with Auto-Detect
        this.dom.input.addEventListener('input', (e) => {
            if (this.state.autoDetect) this.detectPlatform(e.target.value);
        });

        // Paste Button
        this.dom.pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                this.dom.input.value = text;
                if (this.state.autoDetect) this.detectPlatform(text);
                this.showToast('Link pasted from clipboard');
            } catch (err) {
                this.showToast('Failed to read clipboard', 'error');
            }
        });

        // Platform Select Change
        this.dom.platformSelect.addEventListener('change', (e) => {
            if (e.target.value === 'auto') {
                this.state.autoDetect = true;
                this.detectPlatform(this.dom.input.value);
            } else {
                this.state.autoDetect = false;
                this.setTheme(e.target.value);
            }
        });

        // Fetch Action
        this.dom.fetchBtn.addEventListener('click', () => this.handleFetch());
        this.dom.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleFetch();
        });

        // Mobile Sidebar
        const toggleMenu = () => {
            this.dom.sidebar.classList.toggle('open');
        };
        this.dom.menuBtn.addEventListener('click', toggleMenu);
        this.dom.backdrop.addEventListener('click', () => this.dom.sidebar.classList.remove('open'));

        // History Actions
        this.dom.clearHistoryBtn.addEventListener('click', () => {
            this.state.history = [];
            this.saveHistory();
            this.renderHistory();
        });

        this.dom.clearResultsBtn.addEventListener('click', () => {
           this.dom.resultsGrid.innerHTML = `
            <div class="glass-panel" style="grid-column: 1/-1; padding: 40px; text-align: center; border-style: dashed; opacity: 0.5;">
                <i class="fa-solid fa-layer-group" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>Waiting for link...</p>
            </div>`; 
        });
    }

    detectPlatform(url) {
        let found = false;
        for (const key in this.platformConfig) {
            if (key === 'default') continue;
            if (this.platformConfig[key].regex.test(url)) {
                this.setTheme(this.platformConfig[key].theme);
                // Update select dropdown visually without triggering change event logic
                this.dom.platformSelect.value = this.state.autoDetect ? 'auto' : this.platformConfig[key].theme; 
                found = true;
                break;
            }
        }
        if (!found && this.state.autoDetect) this.setTheme('theme-default');
    }

    setTheme(themeName) {
        document.documentElement.className = themeName;
        
        // Update Icon
        let iconClass = 'fa-solid fa-bolt'; // default
        Object.values(this.platformConfig).forEach(cfg => {
            if (cfg.theme === themeName) iconClass = cfg.icon;
        });
        this.dom.brandIcon.className = iconClass;
    }

    async handleFetch() {
        const url = this.dom.input.value.trim();
        if (!url) return this.showToast('Please enter a valid URL', 'error');

        this.setLoading(true, "Analyzing metadata...");

        try {
            // --- MOCK API CALL START ---
            // In a real scenario, this is where you fetch() your RapidAPI endpoint
            // Example: const res = await fetch(`https://api.douyin.wtf/api?url=${url}`);
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating network request
            
            // Mock Response Data
            const mockData = {
                title: "Amazing Content Video " + Math.floor(Math.random() * 1000),
                thumbnail: `https://placehold.co/600x400/222/FFF?text=Video+Thumbnail`,
                duration: "03:45",
                qualities: ["1080p", "720p", "480p"],
                platform: this.state.currentPlatform
            };
            // --- MOCK API CALL END ---

            this.renderCard(mockData, url);
            this.addToHistory(url, mockData.title);
            this.showToast('Video data retrieved successfully!');
            this.dom.input.value = ''; // clear input

        } catch (error) {
            this.showToast('Failed to fetch video. API Error.', 'error');
            console.error(error);
        } finally {
            this.setLoading(false);
        }
    }

    renderCard(data, sourceUrl) {
        // If first card, clear placeholder
        if (this.dom.resultsGrid.querySelector('.fa-layer-group')) {
            this.dom.resultsGrid.innerHTML = '';
        }

        const clone = this.dom.template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        
        // Populate Data
        clone.querySelector('.card-title').textContent = data.title;
        clone.querySelector('img').src = data.thumbnail;
        clone.querySelector('.duration-badge').textContent = data.duration;

        // Format Toggles Logic
        const formatChips = card.querySelectorAll('#format-options .q-chip');
        formatChips.forEach(chip => {
            chip.addEventListener('click', () => {
                formatChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Quality Toggles Logic
        const qualityContainer = card.querySelector('#quality-options');
        qualityContainer.innerHTML = ''; // reset default
        data.qualities.forEach((q, index) => {
            const chip = document.createElement('div');
            chip.className = `q-chip ${index === 0 ? 'active' : ''}`;
            chip.textContent = q;
            chip.addEventListener('click', () => {
                qualityContainer.querySelectorAll('.q-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
            qualityContainer.appendChild(chip);
        });

        // Download Button Logic
        const btn = card.querySelector('.btn-download');
        btn.addEventListener('click', () => this.triggerDownload(data.title));

        this.dom.resultsGrid.prepend(clone);
    }

    async triggerDownload(filename) {
        this.setLoading(true, "Converting stream...");
        // Simulating conversion/download process
        await new Promise(r => setTimeout(r, 1500));
        
        this.setLoading(false);
        this.showToast(`Download started: ${filename}`);
        
        // In real app: window.location.href = download_url;
        // Here we simulate a file download for UX
        const a = document.createElement('a');
        a.href = '#';
        a.download = filename;
        // a.click(); // blocked in snippets, but works in real browser
    }

    addToHistory(url, title) {
        // Prevent duplicates at the top
        if (this.state.history.length > 0 && this.state.history[0].url === url) return;

        this.state.history.unshift({ url, title, date: new Date().toLocaleDateString() });
        if (this.state.history.length > 10) this.state.history.pop(); // Keep last 10
        
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('dl_history', JSON.stringify(this.state.history));
    }

    renderHistory() {
        this.dom.historyContainer.innerHTML = '';
        
        if (this.state.history.length === 0) {
            this.dom.historyContainer.innerHTML = `<div style="padding: 10px; text-align: center; opacity: 0.5; font-size: 0.8rem;">No recent history</div>`;
            return;
        }

        this.state.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <i class="fa-solid fa-link history-icon"></i>
                <span class="history-text">${item.title}</span>
            `;
            div.addEventListener('click', () => {
                this.dom.input.value = item.url;
                if(this.state.autoDetect) this.detectPlatform(item.url);
            });
            this.dom.historyContainer.appendChild(div);
        });
    }

    setLoading(active, text = "Loading...") {
        this.state.isLoading = active;
        this.dom.overlayText.textContent = text;
        if (active) this.dom.overlay.classList.add('active');
        else this.dom.overlay.classList.remove('active');
    }

    showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
        const color = type === 'error' ? '#ff4757' : 'var(--accent)';
        
        toast.style.borderLeftColor = color;
        toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${color}"></i> <span>${msg}</span>`;
        
        this.dom.toastContainer.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new DownloaderApp();
    app.init();
});
