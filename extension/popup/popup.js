// Harveey Extension Popup Script

class HarveeyPopup {
  constructor() {
    this.appUrl = 'http://localhost:3000';
    this.urls = [];
    this.detectedMedia = [];
    this.history = [];
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadHistory();
    this.bindEvents();
    this.checkConnection();
    this.detectPageMedia();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['appUrl']);
    if (result.appUrl) {
      this.appUrl = result.appUrl;
      document.getElementById('appUrl').value = result.appUrl;
    }
  }

  async loadHistory() {
    const result = await chrome.storage.local.get(['downloadHistory']);
    this.history = result.downloadHistory || [];
    this.renderHistory();
  }

  bindEvents() {
    // URL input
    document.getElementById('urlInput').addEventListener('input', () => this.updateUrlCount());
    
    // Buttons
    document.getElementById('pasteBtn').addEventListener('click', () => this.pasteFromClipboard());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
    document.getElementById('extractPageBtn').addEventListener('click', () => this.extractCurrentPage());
    document.getElementById('sendSelectedBtn').addEventListener('click', () => this.sendUrls());
    document.getElementById('sendDetectedBtn').addEventListener('click', () => this.sendDetectedMedia());
    document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
    document.getElementById('openAppBtn').addEventListener('click', () => this.openApp());
    document.getElementById('viewHistoryBtn').addEventListener('click', () => this.openApp('/history'));
  }

  async checkConnection() {
    const statusEl = document.getElementById('status');
    try {
      const response = await fetch(`${this.appUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        statusEl.classList.remove('disconnected');
        statusEl.querySelector('.status-text').textContent = 'Connected';
      } else {
        throw new Error('Not ok');
      }
    } catch (error) {
      statusEl.classList.add('disconnected');
      statusEl.querySelector('.status-text').textContent = 'Disconnected';
    }
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const current = document.getElementById('urlInput').value;
      document.getElementById('urlInput').value = current + (current ? '\n' : '') + text;
      this.updateUrlCount();
      this.showToast('Pasted from clipboard', 'success');
    } catch (error) {
      this.showToast('Could not access clipboard', 'error');
    }
  }

  clearInput() {
    document.getElementById('urlInput').value = '';
    this.updateUrlCount();
  }

  updateUrlCount() {
    const text = document.getElementById('urlInput').value;
    this.urls = text.split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://')));
    
    const count = this.urls.length;
    document.getElementById('urlCount').textContent = count;
    document.getElementById('sendSelectedBtn').disabled = count === 0;
  }

  async extractCurrentPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      this.showToast('No active tab found', 'error');
      return;
    }

    // Send message to content script to extract media
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractMedia' });
      if (response && response.media && response.media.length > 0) {
        this.detectedMedia = response.media;
        this.renderDetectedMedia();
        this.showToast(`Found ${response.media.length} media items`, 'success');
      } else {
        this.showToast('No media found on this page', 'error');
      }
    } catch (error) {
      this.showToast('Could not extract media from this page', 'error');
    }
  }

  renderDetectedMedia() {
    const section = document.getElementById('detectedSection');
    const list = document.getElementById('detectedList');
    
    if (this.detectedMedia.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    list.innerHTML = this.detectedMedia.slice(0, 5).map(item => `
      <div class="detected-item">
        <img class="detected-thumb" src="${item.thumbnail || item.url}" alt="">
        <div class="detected-info">
          <div class="detected-type">${item.type || 'media'}</div>
          <div class="detected-url">${this.truncateUrl(item.url)}</div>
        </div>
      </div>
    `).join('');

    if (this.detectedMedia.length > 5) {
      list.innerHTML += `<div class="detected-item" style="justify-content: center; color: #666; font-size: 11px;">+${this.detectedMedia.length - 5} more</div>`;
    }
  }

  async sendUrls() {
    if (this.urls.length === 0) return;

    try {
      const response = await fetch(`${this.appUrl}/api/extension/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: this.urls })
      });

      const data = await response.json();
      
      if (data.success) {
        this.showToast(`Sent ${this.urls.length} URLs to Harveey`, 'success');
        this.clearInput();
        
        // Add to history
        this.urls.forEach(url => {
          this.addToHistory({
            url,
            filename: 'Pending...',
            type: 'unknown',
            status: 'pending',
            timestamp: Date.now()
          });
        });
      } else {
        throw new Error(data.error || 'Failed to send URLs');
      }
    } catch (error) {
      this.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async sendDetectedMedia() {
    if (this.detectedMedia.length === 0) return;

    const urls = this.detectedMedia.map(m => m.url);

    try {
      const response = await fetch(`${this.appUrl}/api/extension/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      const data = await response.json();
      
      if (data.success) {
        this.showToast(`Sent ${urls.length} media items to Harveey`, 'success');
        this.detectedMedia = [];
        this.renderDetectedMedia();
      } else {
        throw new Error(data.error || 'Failed to send media');
      }
    } catch (error) {
      this.showToast(`Error: ${error.message}`, 'error');
    }
  }

  async detectPageMedia() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !this.isSocialMediaUrl(tab.url)) return;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getMediaCount' });
      if (response && response.count > 0) {
        this.detectedMedia = response.media || [];
        this.renderDetectedMedia();
      }
    } catch (error) {
      // Content script might not be loaded yet
    }
  }

  isSocialMediaUrl(url) {
    const patterns = [
      'twitter.com', 'x.com', 'instagram.com', 'facebook.com',
      'reddit.com', 'tiktok.com', 'youtube.com', 'redgifs.com'
    ];
    return patterns.some(p => url.includes(p));
  }

  async saveSettings() {
    const appUrl = document.getElementById('appUrl').value.trim();
    if (appUrl) {
      this.appUrl = appUrl;
      await chrome.storage.local.set({ appUrl });
      this.showToast('Settings saved', 'success');
      this.checkConnection();
    }
  }

  openApp(path = '') {
    chrome.tabs.create({ url: `${this.appUrl}${path}` });
  }

  async addToHistory(item) {
    this.history.unshift(item);
    // Keep only last 100 items
    this.history = this.history.slice(0, 100);
    await chrome.storage.local.set({ downloadHistory: this.history });
    this.renderHistory();
  }

  renderHistory() {
    const list = document.getElementById('historyList');
    
    if (this.history.length === 0) {
      list.innerHTML = '<div class="history-empty">No downloads yet</div>';
      return;
    }

    list.innerHTML = this.history.slice(0, 5).map(item => `
      <div class="history-item">
        <div class="history-thumb" style="background: #1a1a1a; display: flex; align-items: center; justify-content: center;">
          ${item.type === 'video' ? '🎬' : item.type === 'image' ? '🖼️' : '📄'}
        </div>
        <div class="history-info">
          <div class="history-filename">${item.filename || 'Unknown'}</div>
          <div class="history-meta">${this.formatTime(item.timestamp)}</div>
        </div>
        <span class="history-status ${item.status || 'completed'}">${item.status || 'done'}</span>
      </div>
    `).join('');
  }

  formatTime(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  truncateUrl(url) {
    try {
      const u = new URL(url);
      return u.pathname.length > 30 ? u.pathname.slice(0, 30) + '...' : u.pathname;
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url;
    }
  }

  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new HarveeyPopup();
});
