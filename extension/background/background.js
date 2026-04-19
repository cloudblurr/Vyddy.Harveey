// Harveey Extension Background Service Worker

const DEFAULT_APP_URL = 'http://localhost:3000';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Harveey extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    appUrl: DEFAULT_APP_URL,
    downloadHistory: []
  });

  // Create context menu items
  createContextMenus();
});

// Create context menus
function createContextMenus() {
  // Remove existing menus first
  chrome.contextMenus.removeAll(() => {
    // Menu for links
    chrome.contextMenus.create({
      id: 'send-link-to-harveey',
      title: 'Send to Harveey',
      contexts: ['link']
    });

    // Menu for images
    chrome.contextMenus.create({
      id: 'send-image-to-harveey',
      title: 'Send Image to Harveey',
      contexts: ['image']
    });

    // Menu for videos
    chrome.contextMenus.create({
      id: 'send-video-to-harveey',
      title: 'Send Video to Harveey',
      contexts: ['video']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'separator',
      type: 'separator',
      contexts: ['link', 'image', 'video']
    });

    // Extract page menu
    chrome.contextMenus.create({
      id: 'extract-page-media',
      title: 'Extract All Media from Page',
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { appUrl } = await chrome.storage.local.get(['appUrl']);
  const endpoint = `${appUrl || DEFAULT_APP_URL}/api/extension/send`;

  switch (info.menuItemId) {
    case 'send-link-to-harveey':
      await sendToHarveey(endpoint, [info.linkUrl], 'link');
      break;

    case 'send-image-to-harveey':
      await sendToHarveey(endpoint, [info.srcUrl], 'image');
      break;

    case 'send-video-to-harveey':
      await sendToHarveey(endpoint, [info.srcUrl], 'video');
      break;

    case 'extract-page-media':
      await extractPageMedia(tab, appUrl || DEFAULT_APP_URL);
      break;
  }
});

// Send URLs to Harveey app
async function sendToHarveey(endpoint, urls, type = 'unknown') {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, type })
    });

    const data = await response.json();

    if (data.success) {
      // Add to history
      await addToHistory(urls.map(url => ({
        url,
        filename: extractFilename(url),
        type,
        status: 'completed',
        timestamp: Date.now()
      })));

      showNotification('Sent to Harveey', `${urls.length} item${urls.length > 1 ? 's' : ''} sent successfully`);
    } else {
      throw new Error(data.error || 'Failed to send');
    }
  } catch (error) {
    console.error('Error sending to Harveey:', error);
    showNotification('Error', error.message, 'error');
  }
}

// Extract all media from current page
async function extractPageMedia(tab, appUrl) {
  try {
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractMedia' });
    
    if (response && response.media && response.media.length > 0) {
      const urls = response.media.map(m => m.url);
      await sendToHarveey(`${appUrl}/api/extension/send`, urls, 'mixed');
    } else {
      showNotification('No Media', 'No media found on this page', 'warning');
    }
  } catch (error) {
    console.error('Error extracting page media:', error);
    showNotification('Error', 'Could not extract media from this page', 'error');
  }
}

// Add items to download history
async function addToHistory(items) {
  const result = await chrome.storage.local.get(['downloadHistory']);
  let history = result.downloadHistory || [];
  
  history = [...items, ...history].slice(0, 100); // Keep last 100 items
  
  await chrome.storage.local.set({ downloadHistory: history });
}

// Extract filename from URL
function extractFilename(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop();
    return filename || 'unknown';
  } catch {
    return 'unknown';
  }
}

// Show notification (using action badge)
function showNotification(title, message, type = 'success') {
  // Set badge
  chrome.action.setBadgeText({ text: type === 'error' ? '!' : '✓' });
  chrome.action.setBadgeBackgroundColor({ 
    color: type === 'error' ? '#f44336' : '#4caf50' 
  });

  // Clear badge after 3 seconds
  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
  }, 3000);
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendToHarveey') {
    sendToHarveey(request.endpoint, request.urls, request.type)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'getHistory') {
    chrome.storage.local.get(['downloadHistory']).then(result => {
      sendResponse({ history: result.downloadHistory || [] });
    });
    return true;
  }

  if (request.action === 'clearHistory') {
    chrome.storage.local.set({ downloadHistory: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  return true;
});

// Handle keyboard shortcut
chrome.commands?.onCommand?.addListener(async (command) => {
  if (command === 'extract-media') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const { appUrl } = await chrome.storage.local.get(['appUrl']);
      await extractPageMedia(tab, appUrl || DEFAULT_APP_URL);
    }
  }
});
