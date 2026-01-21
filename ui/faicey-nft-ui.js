/**
 * Faicey NFT UI Integration
 * Adds right-click context menu for one-click NFT minting
 */

class FaiceyNFTUI {
  constructor(options = {}) {
    this.arcExtension = options.arcExtension;
    this.personas = options.personas || ['professor-codephreak', 'mindx-base', 'friendly-assistant', 'mysterious-oracle', 'jaimla'];
    this.contextMenu = null;
    this.currentPersona = null;

    this.init();
  }

  init() {
    this.createContextMenu();
    this.bindEvents();
    this.injectStyles();

    console.log('🎨 Faicey NFT UI initialized');
  }

  createContextMenu() {
    // Create context menu element
    this.contextMenu = document.createElement('div');
    this.contextMenu.id = 'faicey-nft-context-menu';
    this.contextMenu.className = 'faicey-context-menu';
    this.contextMenu.innerHTML = `
      <div class="faicey-context-menu-header">
        <span class="faicey-icon">🎨</span>
        <span>Faicey NFT Actions</span>
      </div>
      <div class="faicey-context-menu-items">
        <!-- Items will be populated dynamically -->
      </div>
    `;

    document.body.appendChild(this.contextMenu);

    // Hide menu initially
    this.contextMenu.style.display = 'none';
  }

  bindEvents() {
    console.log('🔗 Binding NFT UI events...');

    // Right-click event
    document.addEventListener('contextmenu', (e) => {
      console.log('🎯 Context menu event triggered');
      this.handleRightClick(e);
    });

    console.log('✅ NFT UI events bound');

    // Click outside to hide menu
    document.addEventListener('click', (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.hideContextMenu();
      }
    });

    // Persona selection changes
    const personaSelect = document.getElementById('persona-select');
    if (personaSelect) {
      personaSelect.addEventListener('change', (e) => {
        this.currentPersona = e.target.value;
      });
    }

    // Initialize current persona
    if (personaSelect) {
      this.currentPersona = personaSelect.value;
      console.log('🎭 Initial persona set to:', this.currentPersona);
    } else {
      console.log('⚠️ Persona select element not found');
    }
  }

  handleRightClick(e) {
    console.log('🎯 Right-click detected on:', e.target.tagName, e.target.className, 'Current persona:', this.currentPersona);

    // Check if right-click is on a persona-related element
    const target = e.target;
    const isPersonaElement = target.closest('.persona-display, .face-container, #container, canvas, body, html');

    // Allow right-click anywhere for now to test
    const allowAnywhere = true; // this.currentPersona; // Temporarily allow anywhere

    console.log('Element check - isPersonaElement:', isPersonaElement, 'allowAnywhere:', allowAnywhere);

    // Always prevent default and show menu for testing
    e.preventDefault();
    console.log('🎨 Showing NFT context menu');
    this.showContextMenu(e.clientX, e.clientY, this.currentPersona || 'professor-codephreak');

    // Old logic (commented out for testing)
    /*
    if (isPersonaElement || allowAnywhere) {
      e.preventDefault();
      console.log('Showing context menu for persona:', this.currentPersona || 'none');
      this.showContextMenu(e.clientX, e.clientY, this.currentPersona);
    } else {
      console.log('Right-click not on allowed element');
    }
    */
  }

  showContextMenu(x, y, personaId) {
    const menuItems = this.contextMenu.querySelector('.faicey-context-menu-items');
    menuItems.innerHTML = '';

    // Check if extension exists and is connected
    if (!this.arcExtension) {
      // Show message to load extension
      const item = document.createElement('div');
      item.className = 'faicey-context-menu-item';
      item.innerHTML = `
        <span class="faicey-item-icon">⚠️</span>
        <span class="faicey-item-label">NFT Extension Not Loaded</span>
      `;
      item.style.color = '#ffaa00';
      item.style.cursor = 'default';
      menuItems.appendChild(item);

      // Add a test item for debugging
      const testItem = document.createElement('div');
      testItem.className = 'faicey-context-menu-item';
      testItem.innerHTML = `
        <span class="faicey-item-icon">🧪</span>
        <span class="faicey-item-label">Test Menu (Debug)</span>
      `;
      testItem.addEventListener('click', () => {
        this.hideContextMenu();
        this.showNotification('🎯 Right-click menu is working!', 'success');
      });
      menuItems.appendChild(testItem);
    } else {
      // Get available actions from extension
      const actions = this.arcExtension.getContextMenuItems();

      if (actions.length === 0) {
        // Show connect option if no actions available
        const connectItem = document.createElement('div');
        connectItem.className = 'faicey-context-menu-item';
        connectItem.innerHTML = `
          <span class="faicey-item-icon">🔗</span>
          <span class="faicey-item-label">Connect to Arc Chain</span>
        `;
        connectItem.addEventListener('click', async () => {
          this.hideContextMenu();
          await this.connectToArcChain();
        });
        menuItems.appendChild(connectItem);
      } else {
        // Show available actions
        let hasActions = false;
        actions.forEach(action => {
          // For debugging, show all actions, but check conditions when possible
          const shouldShow = !action.condition || action.condition(personaId);
          if (shouldShow) {
            const item = document.createElement('div');
            item.className = 'faicey-context-menu-item';
            item.innerHTML = `
              <span class="faicey-item-icon">${action.icon}</span>
              <span class="faicey-item-label">${action.label}</span>
            `;

            item.addEventListener('click', async () => {
              this.hideContextMenu();
              await this.executeAction(action, personaId);
            });

            menuItems.appendChild(item);
            hasActions = true;
          }
        });

        // If no actions available, show a test action
        if (!hasActions) {
          const testItem = document.createElement('div');
          testItem.className = 'faicey-context-menu-item';
          testItem.innerHTML = `
            <span class="faicey-item-icon">🧪</span>
            <span class="faicey-item-label">Test NFT Menu</span>
          `;
          testItem.addEventListener('click', () => {
            this.hideContextMenu();
            this.showNotification('🎨 NFT menu is working! Extension: ' + (this.arcExtension ? 'Loaded' : 'Not loaded'), 'success');
          });
          menuItems.appendChild(testItem);
        }
      }
    }

    actions.forEach(action => {
      if (action.condition(personaId)) {
        const item = document.createElement('div');
        item.className = 'faicey-context-menu-item';
        item.innerHTML = `
          <span class="faicey-item-icon">${action.icon}</span>
          <span class="faicey-item-label">${action.label}</span>
        `;

        item.addEventListener('click', async () => {
          try {
            this.hideContextMenu();
            await this.executeAction(action, personaId);
          } catch (error) {
            this.showNotification('❌ ' + error.message, 'error');
          }
        });

        menuItems.appendChild(item);
      }
    });

    // Position menu
    this.contextMenu.style.left = x + 'px';
    this.contextMenu.style.top = y + 'px';
    this.contextMenu.style.display = 'block';

    // Adjust position if menu goes off screen
    const rect = this.contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      this.contextMenu.style.top = (y - rect.height) + 'px';
    }
  }

  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.display = 'none';
    }
  }

  async executeAction(action, personaId) {
    this.showNotification('⏳ Processing...', 'info');

    try {
      const result = await action.action(personaId);

      if (action.id === 'mint-nft' && result.success) {
        this.showNotification('✅ NFT minted successfully!', 'success');

        // Show transaction details
        setTimeout(() => {
          this.showMintResult(result);
        }, 1000);
      } else if (action.id === 'view-nft') {
        this.showNotification('🔍 Opening ArcScan...', 'info');
      }

    } catch (error) {
      console.error('Action failed:', error);
      this.showNotification('❌ ' + error.message, 'error');
    }
  }

  showMintResult(result) {
    const modal = document.createElement('div');
    modal.className = 'faicey-nft-modal';
    modal.innerHTML = `
      <div class="faicey-modal-content">
        <div class="faicey-modal-header">
          <h3>🎉 NFT Minted Successfully!</h3>
          <button class="faicey-modal-close">&times;</button>
        </div>
        <div class="faicey-modal-body">
          <div class="faicey-nft-info">
            <p><strong>Token ID:</strong> ${result.tokenId}</p>
            <p><strong>Transaction:</strong> <a href="${result.explorerUrl}" target="_blank">${result.transactionHash.slice(0, 10)}...</a></p>
            <p><strong>Metadata:</strong> <a href="${result.metadataURI.replace('ipfs://', 'https://ipfs.io/ipfs/')}" target="_blank">View on IPFS</a></p>
          </div>
          <div class="faicey-modal-actions">
            <button class="faicey-btn-primary" onclick="window.open('${result.explorerUrl}', '_blank')">
              View on ArcScan
            </button>
            <button class="faicey-btn-secondary" onclick="this.closest('.faicey-nft-modal').remove()">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal events
    modal.querySelector('.faicey-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.faicey-notification');
    existing.forEach(el => el.remove());

    // Create notification
    const notification = document.createElement('div');
    notification.className = `faicey-notification faicey-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  injectStyles() {
    const styles = `
      /* Context Menu Styles */
      .faicey-context-menu {
        position: fixed;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #00ff00;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 255, 0, 0.3);
        z-index: 10000;
        min-width: 200px;
        font-family: 'Courier New', monospace;
        color: #00ff00;
      }

      .faicey-context-menu-header {
        padding: 12px 16px;
        border-bottom: 1px solid #00ff00;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
      }

      .faicey-context-menu-items {
        padding: 4px 0;
      }

      .faicey-context-menu-item {
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s;
      }

      .faicey-context-menu-item:hover {
        background: rgba(0, 255, 0, 0.1);
      }

      .faicey-item-icon {
        font-size: 14px;
      }

      /* Modal Styles */
      .faicey-nft-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        font-family: 'Courier New', monospace;
      }

      .faicey-modal-content {
        background: #000;
        border: 2px solid #00ff00;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 255, 0, 0.4);
      }

      .faicey-modal-header {
        padding: 20px;
        border-bottom: 1px solid #00ff00;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .faicey-modal-header h3 {
        margin: 0;
        color: #00ff00;
      }

      .faicey-modal-close {
        background: none;
        border: none;
        color: #00ff00;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .faicey-modal-body {
        padding: 20px;
      }

      .faicey-nft-info p {
        margin: 8px 0;
        color: #00ff00;
      }

      .faicey-nft-info a {
        color: #00aaff;
        text-decoration: none;
      }

      .faicey-nft-info a:hover {
        text-decoration: underline;
      }

      .faicey-modal-actions {
        margin-top: 20px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .faicey-btn-primary, .faicey-btn-secondary {
        padding: 10px 20px;
        border: 1px solid #00ff00;
        background: transparent;
        color: #00ff00;
        cursor: pointer;
        border-radius: 4px;
        font-family: inherit;
        transition: all 0.2s;
      }

      .faicey-btn-primary:hover {
        background: #00ff00;
        color: #000;
      }

      .faicey-btn-secondary:hover {
        background: rgba(0, 255, 0, 0.1);
      }

      /* Notification Styles */
      .faicey-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        z-index: 10002;
        max-width: 400px;
        word-wrap: break-word;
      }

      .faicey-info {
        background: rgba(0, 170, 255, 0.9);
        color: white;
        border: 1px solid #00aaff;
      }

      .faicey-success {
        background: rgba(0, 255, 0, 0.9);
        color: black;
        border: 1px solid #00ff00;
      }

      .faicey-error {
        background: rgba(255, 0, 0, 0.9);
        color: white;
        border: 1px solid #ff0000;
      }

      /* Hide context menu by default */
      #faicey-nft-context-menu {
        display: none;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Public API
  updateCurrentPersona(personaId) {
    this.currentPersona = personaId;
  }

  setArcExtension(extension) {
    this.arcExtension = extension;
  }

  async connectToArcChain() {
    if (!this.arcExtension) {
      this.showNotification('❌ Arc Chain extension not available', 'error');
      return;
    }

    try {
      this.showNotification('🔗 Connecting to Arc Chain...', 'info');
      await this.arcExtension.initialize();
      this.showNotification('✅ Connected to Arc Chain!', 'success');

      // Update extension reference if it changed during initialization
      if (window.faiceyArcChainExtension && window.faiceyArcChainExtension !== this.arcExtension) {
        this.arcExtension = window.faiceyArcChainExtension;
      }
    } catch (error) {
      console.error('Failed to connect to Arc Chain:', error);
      this.showNotification('❌ Failed to connect: ' + error.message, 'error');
    }
  }

  getStatus() {
    return {
      initialized: true,
      currentPersona: this.currentPersona,
      arcExtension: !!this.arcExtension,
      arcExtensionConnected: this.arcExtension?.isConnected || false,
      contextMenu: !!this.contextMenu
    };
  }
}

// Test function for debugging
if (typeof window !== 'undefined') {
  window.testNFTRightClick = function() {
    console.log('🧪 Testing NFT right-click functionality');
    console.log('NFT UI available:', !!window.faiceyNFTUI);
    console.log('Arc extension available:', !!window.faiceyArcChainExtension);
    if (window.faiceyNFTUI) {
      console.log('Current persona:', window.faiceyNFTUI.currentPersona);
      console.log('Extension connected:', !!window.faiceyNFTUI.arcExtension);
      // Manually trigger context menu
      window.faiceyNFTUI.showContextMenu(100, 100, window.faiceyNFTUI.currentPersona || 'professor-codephreak');
    }
  };
}

// Auto-initialize if Arc Chain extension is available
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    // Create UI instance
    window.faiceyNFTUI = new FaiceyNFTUI();

    // Check for extension periodically (in case it loads later)
    const checkForExtension = () => {
      if (window.faiceyArcChainExtension && !window.faiceyNFTUI.arcExtension) {
        window.faiceyNFTUI.setArcExtension(window.faiceyArcChainExtension);
        console.log('🎨 NFT UI connected to Arc Chain extension');
      }
    };

    // Debug logging
    console.log('🎨 Faicey NFT UI initialized');
    console.log('Arc Chain extension available:', !!window.faiceyArcChainExtension);

    // Check immediately
    checkForExtension();

    // Check periodically for extension availability
    const extensionCheckInterval = setInterval(checkForExtension, 1000);

    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(extensionCheckInterval);
    }, 30000);
  });
}

export default FaiceyNFTUI;