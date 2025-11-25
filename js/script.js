/**

UNIVERSAL DOWNLOADER — BACKEND CONNECTED VERSION

(UI tetap sama, logika backend diperbarui)
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
        clearResultsBtn: document.getElementById('clear-results'),  
        toastContainer: document.getElementById('toast-container')  
    };  

    this.platformConfig = {  
        youtube: { theme: 'theme-youtube', icon: 'fa-brands fa-youtube', regex: /youtube\.com|youtu\.be/ },  
        tiktok:  { theme: 'theme-tiktok', icon: 'fa-brands fa-tiktok', regex: /tiktok\.com/ },  
        instagram: { theme: 'theme-instagram', icon: 'fa-brands fa-instagram', regex: /instagram\.com/ },  
        facebook: { theme: 'theme-facebook', icon: 'fa-brands fa-facebook', regex: /facebook\.com|fb\.watch/ },  
        twitter: { theme: 'theme-x', icon: 'fa-brands fa-x-twitter', regex: /twitter\.com|x\.com/ },  
        default: { theme: 'theme-default', icon: 'fa-solid fa-bolt', regex: null }  
    };  
}  

init() {  
    this.bindEvents();  
    this.renderHistory();  
    setTimeout(() => document.body.style.opacity = "1", 100);  
}  

bindEvents() {  
    this.dom.input.addEventListener('input', e => {  
        if (this.state.autoDetect) this.detectPlatform(e.target.value);  
    });  

    this.dom.pasteBtn.addEventListener('click', async () => {  
        try {  
            const text = await navigator.clipboard.readText();  
            this.dom.input.value = text;  
            if (this.state.autoDetect) this.detectPlatform(text);  
            this.showToast('Link pasted from clipboard');  
        } catch {  
            this.showToast('Clipboard access denied', 'error');  
        }  
    });  

    this.dom.platformSelect.addEventListener('change', e => {  
        if (e.target.value === 'auto') {  
            this.state.autoDetect = true;  
            this.detectPlatform(this.dom.input.value);  
        } else {  
            this.state.autoDetect = false;  
            this.setTheme(e.target.value);  
        }  
    });  

    this.dom.fetchBtn.addEventListener('click', () => this.handleFetch());  
    this.dom.input.addEventListener('keypress', e => {  
        if (e.key === 'Enter') this.handleFetch();  
    });  

    this.dom.menuBtn.addEventListener('click', () => {  
        this.dom.sidebar.classList.toggle('open');  
    });  
    this.dom.backdrop.addEventListener('click', () => {  
        this.dom.sidebar.classList.remove('open');  
    });  

    this.dom.clearHistoryBtn.addEventListener('click', () => {  
        this.state.history = [];  
        this.saveHistory();  
        this.renderHistory();  
    });  

    this.dom.clearResultsBtn.addEventListener('click', () => {  
        this.dom.resultsGrid.innerHTML = `  
        <div class="glass-panel" style="grid-column:1/-1; padding:40px; text-align:center; border-style:dashed; opacity:.5;">  
            <i class="fa-solid fa-layer-group" style="font-size:2rem; margin-bottom:15px;"></i>  
            <p>Waiting for link...</p>  
        </div>`;  
    });  
}  

detectPlatform(url) {  
    let found = false;  
    for (const key in this.platformConfig) {  
        if (key === "default") continue;  
        if (this.platformConfig[key].regex.test(url)) {  
            this.setTheme(this.platformConfig[key].theme);  
            this.dom.platformSelect.value = "auto";  
            found = true;  
            break;  
        }  
    }  
    if (!found && this.state.autoDetect) this.setTheme("theme-default");  
}  

setTheme(themeName) {  
    document.documentElement.className = themeName;  
    let iconClass = 'fa-solid fa-bolt';  
    Object.values(this.platformConfig).forEach(cfg => {  
        if (cfg.theme === themeName) iconClass = cfg.icon;  
    });  
    this.dom.brandIcon.className = iconClass;  
}  

async handleFetch() {  
    const url = this.dom.input.value.trim();  
    if (!url) return this.showToast('Please enter a valid URL', 'error');  

    this.setLoading(true, "Contacting backend...");  

    try {  
        const response = await fetch("https://universal-downloader-production-c2c6.up.railway.app/api/fetch", {  
            method: "POST",  
            headers: { "Content-Type": "application/json" },  
            body: JSON.stringify({ url })  
        });  

        const result = await response.json();  

        if (result.error) {  
            this.showToast("Backend failed: " + result.error, "error");  
        } else {  
            this.showToast("Server is downloading the file!");  
        }  

    } catch (err) {  
        this.showToast("Cannot reach backend server", "error");  
    }  

    this.setLoading(false);  
}  

setLoading(active, text = "Loading...") {  
    this.state.isLoading = active;  
    this.dom.overlayText.textContent = text;  
    if (active) this.dom.overlay.classList.add("active");  
    else this.dom.overlay.classList.remove("active");  
}  

showToast(msg, type = "success") {  
    const toast = document.createElement('div');  
    toast.className = 'toast';  
    const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';  
    const color = type === 'error' ? '#ff4757' : 'var(--accent)';  
      
    toast.style.borderLeftColor = color;  
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${color}"></i> <span>${msg}</span>`;  
      
    this.dom.toastContainer.appendChild(toast);  

    setTimeout(() => {  
        toast.style.opacity = '0';  
        toast.style.transform = 'translateX(100%)';  
        setTimeout(() => toast.remove(), 300);  
    }, 3000);  
}

}

document.addEventListener("DOMContentLoaded", () => {
const app = new DownloaderApp();
app.init();
});
