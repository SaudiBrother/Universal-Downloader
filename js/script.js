/* UNIVERSAL DOWNLOADER LOGIC  */

// Konfigurasi Platform & Tema Visual
const PLATFORM_CONFIG = {
    'theme-youtube': { name: 'YouTube', icon: 'fa-brands fa-youtube', color: '#ff0000' },
    'theme-tiktok': { name: 'TikTok', icon: 'fa-brands fa-tiktok', color: '#00f2ea' },
    'theme-instagram': { name: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E1306C' },
    'theme-facebook': { name: 'Facebook', icon: 'fa-brands fa-facebook', color: '#1877f2' },
    'theme-x': { name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: '#ffffff' }
};

class DownloaderApp {
    constructor() {
        this.dom = {};
        this.state = {
            isFetching: false,
            currentPlatform: 'theme-youtube'
        };
    }

    init() {
        this.cacheDOM();
        this.initEventListeners();
        this.applyTheme(this.state.currentPlatform); // Set default theme
        
        // Simulasi inisialisasi seperti di referensi [cite: 45]
        setTimeout(() => {
            document.getElementById('overlay-layer').classList.remove('active');
        }, 1500);
    }

    cacheDOM() {
        const $ = (s) => document.querySelector(s);
        this.dom = {
            platformSelector: $('#platform-selector'),
            brandIcon: $('#brand-icon'),
            urlInput: $('#url-input'),
            fetchBtn: $('#fetch-btn'),
            resultContainer: $('#result-container'),
            emptyMsg: $('#empty-msg'),
            template: $('#download-card-template'),
            clearBtn: $('#clear-btn'),
            toastContainer: $('#toast-container'),
            overlayLayer: $('#overlay-layer'),
            overlayText: $('#overlay-text')
        };
    }

    initEventListeners() {
        // Ganti Tema saat Platform dipilih [cite: 77]
        this.dom.platformSelector.addEventListener('change', (e) => {
            this.state.currentPlatform = e.target.value;
            this.applyTheme(this.state.currentPlatform);
        });

        // Tombol Fetch [cite: 74]
        this.dom.fetchBtn.addEventListener('click', () => {
            const url = this.dom.urlInput.value.trim();
            if (url) this.handleFetch(url);
            else this.showToast("Please paste a valid link first!");
        });

        // Tombol Clear
        this.dom.clearBtn.addEventListener('click', () => {
            this.dom.resultContainer.innerHTML = '';
            this.dom.emptyMsg.style.display = 'flex';
            this.dom.urlInput.value = '';
        });

        // Enter key support
        this.dom.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.dom.fetchBtn.click();
        });
    }

    applyTheme(themeClass) {
        // Ganti class di HTML tag [cite: 50]
        document.documentElement.className = themeClass;
        
        // Ganti Icon di Sidebar
        const config = PLATFORM_CONFIG[themeClass];
        if (config) {
            this.dom.brandIcon.className = config.icon;
        }
    }

    async handleFetch(url) {
        if (this.state.isFetching) return;
        this.state.isFetching = true;

        // Tampilkan Overlay Loading [cite: 84]
        this.dom.overlayText.textContent = "Fetching Video Info...";
        this.dom.overlayLayer.classList.add('active');

        // SIMULASI PROSES FETCHING (Karena tidak ada backend asli)
        await new Promise(r => setTimeout(r, 2000));

        this.dom.overlayLayer.classList.remove('active');
        this.state.isFetching = false;
        
        this.createResultCard(url);
        this.showToast("Video Found!");
        this.dom.emptyMsg.style.display = 'none';
        this.dom.urlInput.value = '';
    }

    createResultCard(url) {
        const clone = this.dom.template.content.cloneNode(true);
        const card = clone.querySelector('.fx-card');
        
        // Fake Data Generation
        const platformName = PLATFORM_CONFIG[this.state.currentPlatform].name;
        card.querySelector('.fx-name').textContent = `${platformName} Video ${Math.floor(Math.random()*1000)}`;
        
        // Placeholder Image (Warna solid sesuai tema)
        // Di aplikasi nyata, ini adalah thumbnail dari API
        const img = card.querySelector('.video-thumb');
        img.src = `https://placehold.co/600x400/${this.state.currentPlatform === 'theme-x' ? '000000' : '222222'}/FFFFFF/png?text=${platformName}+Video`;

        // Event Listener Tombol Download [cite: 75]
        const btnVideo = card.querySelector('.download-action-video');
        btnVideo.addEventListener('click', () => this.simulateDownload("MP4 Video"));

        const btnAudio = card.querySelector('.download-action-audio');
        btnAudio.addEventListener('click', () => this.simulateDownload("MP3 Audio"));

        this.dom.resultContainer.prepend(card);
    }

    async simulateDownload(type) {
        this.dom.overlayText.textContent = `Converting to ${type}...`;
        this.dom.overlayLayer.classList.add('active');
        
        // Simulasi delay proses download [cite: 88]
        await new Promise(r => setTimeout(r, 1500));
        
        this.dom.overlayLayer.classList.remove('active');
        this.showToast(`${type} Downloaded Successfully!`);
        
        // Trigger fake download file
        const anchor = document.createElement('a');
        anchor.href = '#'; // Link dummy
        anchor.download = `Result_${Date.now()}.${type === 'MP3 Audio' ? 'mp3' : 'mp4'}`;
        // anchor.click(); // Uncomment jika ingin file dummy terunduh
    }

    showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<i class="fa-solid fa-circle-check"></i> &nbsp; ${msg}`;
        this.dom.toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 3000); // [cite: 167]
    }
}

// Init App saat DOM siap
window.addEventListener('DOMContentLoaded', () => new DownloaderApp().init());
