// Harveey Extension Content Script
// Runs on social media pages to detect and extract media

(function() {
  'use strict';

  // Prevent multiple injections
  if (window.__harveeyInjected) return;
  window.__harveeyInjected = true;

  // Media detector
  class MediaDetector {
    constructor() {
      this.media = [];
      this.observer = null;
      this.floatingButton = null;
      this.panel = null;
      
      this.init();
    }

    init() {
      this.detectMedia();
      this.setupObserver();
      this.createFloatingButton();
      this.setupMessageListener();
    }

    detectMedia() {
      this.media = [];
      const seen = new Set();

      // Detect images
      document.querySelectorAll('img').forEach(img => {
        if (img.src && !img.src.startsWith('data:') && img.width > 100 && img.height > 100) {
          const url = this.getHighQualityUrl(img.src);
          if (!seen.has(url)) {
            seen.add(url);
            this.media.push({
              type: 'image',
              url: url,
              thumbnail: img.src,
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height
            });
          }
        }
      });

      // Detect videos
      document.querySelectorAll('video').forEach(video => {
        if (video.src || video.currentSrc) {
          const url = video.src || video.currentSrc;
          if (!seen.has(url)) {
            seen.add(url);
            this.media.push({
              type: 'video',
              url: url,
              thumbnail: video.poster || '',
              width: video.videoWidth,
              height: video.videoHeight
            });
          }
        }
        
        // Check source elements
        video.querySelectorAll('source').forEach(source => {
          if (source.src) {
            const url = source.src;
            if (!seen.has(url)) {
              seen.add(url);
              this.media.push({
                type: 'video',
                url: url,
                thumbnail: video.poster || '',
                width: video.videoWidth,
                height: video.videoHeight
              });
            }
          }
        });
      });

      // Platform-specific detection
      this.detectPlatformSpecific(seen);

      return this.media;
    }

    detectPlatformSpecific(seen) {
      const hostname = window.location.hostname;

      // Instagram
      if (hostname.includes('instagram.com')) {
        // Detect from JSON data
        this.extractFromScripts(seen, /"display_url":"([^"]+)"/g, 'image');
        this.extractFromScripts(seen, /"video_url":"([^"]+)"/g, 'video');
      }

      // Twitter/X
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        // Detect from tweet data
        this.extractFromScripts(seen, /"media_url_https":"([^"]+)"/g, 'image');
        this.extractFromScripts(seen, /"video_info":\{[^}]*"variants":\[[^\]]*"url":"([^"]+)"/g, 'video');
      }

      // TikTok
      if (hostname.includes('tiktok.com')) {
        this.extractFromScripts(seen, /"playAddr":"([^"]+)"/g, 'video');
        this.extractFromScripts(seen, /"cover":"([^"]+)"/g, 'image');
      }

      // Reddit
      if (hostname.includes('reddit.com')) {
        this.extractFromScripts(seen, /"url":"(https?:\/\/[^"]+\.(jpg|png|gif|mp4|webm))"/g, 'image');
      }
    }

    extractFromScripts(seen, regex, type) {
      document.querySelectorAll('script').forEach(script => {
        const content = script.textContent;
        let match;
        while ((match = regex.exec(content)) !== null) {
          let url = match[1];
          // Unescape JSON strings
          url = url.replace(/\\u002F/g, '/').replace(/\\/g, '');
          
          if (!seen.has(url)) {
            seen.add(url);
            this.media.push({
              type: type,
              url: url,
              thumbnail: type === 'video' ? '' : url
            });
          }
        }
      });
    }

    getHighQualityUrl(url) {
      // Try to get higher quality version for known platforms
      if (url.includes('instagram.com')) {
        return url.replace(/\/[sp]\d+x\d+\//, '/').split('?')[0];
      }
      if (url.includes('fbcdn.net')) {
        return url.split('?')[0];
      }
      return url;
    }

    setupObserver() {
      // Watch for dynamically loaded content
      this.observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && (node.tagName === 'IMG' || node.tagName === 'VIDEO' || node.querySelector('img, video'))) {
                shouldUpdate = true;
              }
            });
          }
        });
        
        if (shouldUpdate) {
          this.detectMedia();
          this.updateButtonBadge();
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    createFloatingButton() {
      // Create floating action button
      this.floatingButton = document.createElement('div');
      this.floatingButton.id = 'harveey-fab';
      this.floatingButton.innerHTML = `
        <div class="harveey-fab-inner">
          <span class="harveey-fab-icon">⚡</span>
          <span class="harveey-fab-badge" style="display: none;">0</span>
        </div>
      `;
      this.floatingButton.title = 'Harveey Vyddy - Extract Media';
      
      this.floatingButton.addEventListener('click', () => this.togglePanel());
      document.body.appendChild(this.floatingButton);

      this.updateButtonBadge();
    }

    updateButtonBadge() {
      const badge = this.floatingButton.querySelector('.harveey-fab-badge');
      const count = this.media.length;
      
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    togglePanel() {
      if (this.panel) {
        this.panel.remove();
        this.panel = null;
        return;
      }

      this.createPanel();
    }

    createPanel() {
      this.panel = document.createElement('div');
      this.panel.id = 'harveey-panel';
      
      const mediaHtml = this.media.slice(0, 20).map((item, index) => `
        <div class="harveey-media-item" data-index="${index}">
          <input type="checkbox" class="harveey-checkbox" checked>
          <div class="harveey-media-thumb">
            ${item.type === 'video' ? 
              `<div class="harveey-video-icon">▶</div>` : 
              `<img src="${item.thumbnail || item.url}" alt="" onerror="this.style.display='none'">`
            }
          </div>
          <div class="harveey-media-info">
            <span class="harveey-media-type">${item.type}</span>
            <span class="harveey-media-size">${item.width && item.height ? `${item.width}×${item.height}` : ''}</span>
          </div>
        </div>
      `).join('');

      this.panel.innerHTML = `
        <div class="harveey-panel-header">
          <div class="harveey-panel-title">
            <span>⚡</span> Harveey Vyddy
          </div>
          <button class="harveey-close-btn" title="Close">×</button>
        </div>
        <div class="harveey-panel-content">
          <div class="harveey-stats">
            <span>${this.media.length} media detected</span>
            <button class="harveey-refresh-btn" title="Refresh">↻</button>
          </div>
          <div class="harveey-media-list">
            ${mediaHtml || '<div class="harveey-empty">No media detected on this page</div>'}
          </div>
        </div>
        <div class="harveey-panel-footer">
          <button class="harveey-select-all-btn">Select All</button>
          <button class="harveey-send-btn">Send to Harveey</button>
        </div>
      `;

      document.body.appendChild(this.panel);

      // Bind events
      this.panel.querySelector('.harveey-close-btn').addEventListener('click', () => {
        this.panel.remove();
        this.panel = null;
      });

      this.panel.querySelector('.harveey-refresh-btn').addEventListener('click', () => {
        this.detectMedia();
        this.updateButtonBadge();
        this.panel.remove();
        this.createPanel();
      });

      this.panel.querySelector('.harveey-select-all-btn').addEventListener('click', () => {
        const checkboxes = this.panel.querySelectorAll('.harveey-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
      });

      this.panel.querySelector('.harveey-send-btn').addEventListener('click', () => {
        this.sendSelected();
      });
    }

    async sendSelected() {
      const checkboxes = this.panel.querySelectorAll('.harveey-checkbox:checked');
      const selectedIndices = Array.from(checkboxes).map(cb => 
        parseInt(cb.closest('.harveey-media-item').dataset.index)
      );

      const selectedMedia = selectedIndices.map(i => this.media[i]);

      if (selectedMedia.length === 0) {
        this.showNotification('No media selected', 'error');
        return;
      }

      try {
        // Get app URL from storage
        const result = await chrome.storage.local.get(['appUrl']);
        const appUrl = result.appUrl || 'http://localhost:3000';

        const response = await fetch(`${appUrl}/api/extension/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            urls: selectedMedia.map(m => m.url),
            media: selectedMedia 
          })
        });

        const data = await response.json();

        if (data.success) {
          this.showNotification(`Sent ${selectedMedia.length} items to Harveey`, 'success');
          this.panel.remove();
          this.panel = null;
        } else {
          throw new Error(data.error || 'Failed to send');
        }
      } catch (error) {
        this.showNotification(`Error: ${error.message}`, 'error');
      }
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `harveey-notification harveey-notification-${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('harveey-notification-fade');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    setupMessageListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractMedia') {
          this.detectMedia();
          sendResponse({ media: this.media });
        } else if (request.action === 'getMediaCount') {
          sendResponse({ count: this.media.length, media: this.media });
        }
        return true;
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MediaDetector());
  } else {
    new MediaDetector();
  }
})();
