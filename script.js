document.addEventListener('DOMContentLoaded', function () {
  const scene = document.querySelector('a-scene');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  const debugPanel = document.getElementById('debug-panel');
  const debugToggle = document.getElementById('debug-toggle');
  let botpressInitialized = false;
  
  //  Safe debug function to prevent console[type] error
  function debug(message, type = 'log') {
    if (typeof console[type] === 'function') {
      console[type](message);
    } else {
      console.log(message);
    }

    if (debugPanel) {
      const msgElement = document.createElement('div');
      msgElement.textContent = message;
      msgElement.classList.add(type);
      debugPanel.appendChild(msgElement);

      debugPanel.scrollTop = debugPanel.scrollHeight;

      while (debugPanel.children.length > 50) {
        debugPanel.removeChild(debugPanel.firstChild);
      }
    }
  }

  if (debugToggle) {
    debugToggle.addEventListener('click', function() {
      if (debugPanel.style.display === 'none' || debugPanel.style.display === '') {
        debugPanel.style.display = 'block';
        debugToggle.textContent = 'Hide Debug';
      } else {
        debugPanel.style.display = 'none';
        debugToggle.textContent = 'Show Debug';
      }
    });
  }

  debugPanel.style.display = 'none';
  debugToggle.textContent = 'Show Debug';

  
  // Initialize Botpress
  function initBotpress() {
    if (botpressInitialized) return;
    
    debug("Initializing Botpress", 'log');
    
    // Update styling to ensure proper display
    const webchatDiv = document.getElementById('webchat');
    webchatDiv.style.width = '100%';
    webchatDiv.style.height = '100%';
    
    // Add necessary styles directly to head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      #webchat .bpWebchat {
        position: unset !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        max-width: 100% !important;
      }
      #webchat .bpFab {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Initialize Botpress with the correct configuration
    window.botpress.init({
      "botId": "0d3d94b4-0bdb-4bcc-9e35-e21194ed2c1e",
      "configuration": {
        "composerPlaceholder": "Let's go, Hoots!",
        "botName": "iHooty",
        "botAvatar": "",
        "website": {
          "title": "https://ofallonhoots.com/",
          "link": "https://ofallonhoots.com/"
        },
        "email": {
          "title": "Ofallonhoots@prospectleague.com",
          "link": "Ofallonhoots@prospectleague.com"
        },
        "phone": {
          "title": "6367414668",
          "link": "6367414668"
        },
        "termsOfService": {},
        "privacyPolicy": {},
        "color": "#ffc53d",
        "variant": "solid",
        "themeMode": "light",
        "fontFamily": "ibm",
        "radius": 1
      },
      "clientId": "44c58e23-012d-4aa6-9617-abb818a66b42",
      "selector": "#webchat"
    });
    
    // Set up event listeners
    window.botpress.on("webchat:ready", () => {
      debug("Botpress webchat is ready", 'success');
      botpressInitialized = true;
      
      // Open the chat when it's ready if the container is visible
      if (chatContainer.style.display === 'block') {
        setTimeout(() => {
          window.botpress.open();
          debug('Automatically opening Botpress on ready', 'success');
        }, 300);
      }
    });
    
    window.botpress.on("webchat:message:sent", (event) => {
      const msg = event.message?.text || "";
      debug(`User: ${msg}`, 'log');
      window.hootyController?.reactToMessage(msg);
    });
    
    window.botpress.on("webchat:message:received", (event) => {
      const msg = event.message?.text || "";
      debug(`Bot: ${msg}`, 'log');
      window.hootyController?.reactToBotResponse(msg);
    });
  }
  
  // Toggle debug panel
  if (debugToggle) {
    debugToggle.addEventListener('click', function() {
      if (debugPanel.style.display === 'none' || debugPanel.style.display === '') {
        debugPanel.style.display = 'block';
        debugToggle.textContent = 'Hide Debug';
      } else {
        debugPanel.style.display = 'none';
        debugToggle.textContent = 'Show Debug';
      }
    });
  }
  
  // Initially hide debug panel
  debugPanel.style.display = 'none';
  debugToggle.textContent = 'Show Debug';
  
  // Hooty Controller Class
  class HootyController {
    constructor(model, debugFunction) {
      this.model = model;
      this.debug = debugFunction || console.log;
      this.currentAnimation = 'HappyIdle.glb';
      this.animationTimeout = null;
      this.debug('HootyController initialized', 'success');
    }
    
playAnimation(animFile, duration = 7000) {
  this.debug(`Playing animation: ${animFile}`, 'log');
  this.currentAnimation = animFile;

  if (this.animationTimeout) {
    clearTimeout(this.animationTimeout);
  }

  const hootyModel = document.querySelector('#hooty');
  if (hootyModel) {
    hootyModel.setAttribute('gltf-model', `models/${animFile}`);
    
    hootyModel.addEventListener('model-loaded', () => {
      this.debug(`✅ Hooty animation loaded: ${animFile}`, 'success');
      hootyModel.setAttribute('animation-mixer', { loop: 'repeat' });
      
      if (animFile !== 'HappyIdle.glb') {
        this.animationTimeout = setTimeout(() => {
          this.playAnimation('HappyIdle.glb');
          this.debug('Returning to idle animation', 'log');
        }, duration);
      }
    }, { once: true }); // <- important: only run ONCE when it loads!
  } else {
    this.debug('❌ Hooty model not found in scene', 'error');
  }
}

    reactToMessage(message) {
      this.debug(`Reacting to message: ${message}`, 'log');
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.includes('dance')) {
        this.playAnimation('NorthernSoulSpinCombo.glb');
      } else if (lowerMsg.includes('wave')) {
        this.playAnimation('WaveHipHopDance.glb');
      } else if (lowerMsg.includes('gangnam')) {
        this.playAnimation('GangnamStyle.glb');
      } else if (lowerMsg.includes('salsa')) {
        this.playAnimation('SalsaDancing.glb');
      } else if (lowerMsg.includes('baseball')) {
        if (lowerMsg.includes('pitch')) {
          this.playAnimation('BaseballPitching.glb');
        } else if (lowerMsg.includes('strike')) {
          this.playAnimation('BaseballStrike.glb');
        } else if (lowerMsg.includes('umpire')) {
          this.playAnimation('BaseballUmpire.glb');
        } else if (lowerMsg.includes('milling') || lowerMsg.includes('idle')) {
          this.playAnimation('BaseballMillingIdle.glb');
        } else {
          // Default baseball animation
          this.playAnimation('BaseballPitching.glb');
        }
      } else if (lowerMsg.includes('hip-hop') || lowerMsg.includes('hip hop')) {
        this.playAnimation('Shuffling.glb');
      } else if (lowerMsg.includes('idle')) {
        this.playAnimation('HappyIdle.glb');
      }
    }
    
    reactToBotResponse(message) {
      this.debug(`Bot response: ${message}`, 'log');
      // Add logic to react to bot responses if needed
    }
  }

  // Enhanced Chat Toggle - Fixed for reliable opening/closing
  chatToggle.addEventListener('click', function() {
    debug('Chat toggle clicked', 'log');
    
    // First initialize Botpress if not already done
    if (!botpressInitialized && window.botpress) {
      initBotpress();
    }
    
    // Toggle chat container visibility
    if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
      chatContainer.style.display = 'block';
      debug('Chat container shown', 'success');
      
      // Force chat container to be visible with appropriate z-index
      chatContainer.style.zIndex = '10000';
      
      // Try to open Botpress chat
      if (window.botpress && typeof window.botpress.open === 'function') {
        try {
          setTimeout(() => {
            window.botpress.open();
            debug('Botpress open called', 'success');
          }, 300);
        } catch (err) {
          debug(`Error opening Botpress: ${err.message}`, 'error');
        }
      } else {
        debug('Botpress not available for opening', 'warn');
      }
    } else {
      chatContainer.style.display = 'none';
      debug('Chat container hidden', 'log');
      
      // Try to close Botpress chat
      if (window.botpress && typeof window.botpress.close === 'function') {
        try {
          window.botpress.close();
          debug('Botpress close called', 'log');
        } catch (err) {
          debug(`Error closing Botpress: ${err.message}`, 'error');
        }
      }
    }
  });

  // Create a fresh Hooty model
  function createHootyModel() {
    const hootModel = document.createElement('a-entity');
    hootModel.setAttribute('id', 'hooty');
    hootModel.setAttribute('gltf-model', 'models/HappyIdle.glb');
    hootModel.setAttribute('position', '0 0 -3');
    hootModel.setAttribute('scale', '0.5 0.5 0.5');
    hootModel.setAttribute('animation-mixer', 'loop: repeat');
    hootModel.setAttribute('visible', 'true');
    
    const arContent = document.querySelector('#ar-content') || scene;
    arContent.appendChild(hootModel);
    
    hootModel.addEventListener('model-loaded', () => {
      debug('Hooty model created and loaded successfully', 'success');
      window.hootyController = new HootyController(hootModel, debug);
      setupAnimationButtons();
    });
    
    hootModel.addEventListener('model-error', (err) => {
      debug(`Error loading model: ${err.detail || 'unknown error'}`, 'error');
    });
  }

  function setupAnimationButtons() {
    document.querySelectorAll('.anim-button').forEach(button => {
      const anim = button.getAttribute('data-anim');
      button.addEventListener('click', () => {
        debug(`Button clicked: ${anim}`, 'log');
        window.hootyController?.playAnimation(anim);
      });
    });
  }

  // Check model access to verify files are accessible
  function checkModelFiles() {
    const modelFiles = [
      'models/BaseballMillingIdle.glb',
      'models/BaseballPitching.glb',
      'models/BaseballStrike.glb',
      'models/BaseballUmpire.glb',
      'models/GangnamStyle.glb',
      'models/HappyIdle.glb',
      'models/NorthernSoulSpinCombo.glb',
      'models/Owl_Mascot_0409005910_texture.glb',
      'models/SalsaDancing.glb',
      'models/Shuffling.glb',
      'models/WaveHipHopDance.glb'
    ];
    
    debug('Checking model files...', 'log');
    
    modelFiles.forEach(file => {
      fetch(file)
        .then(res => {
          if (res.ok) {
            debug(`✅ Found: ${file}`, 'success');
          } else {
            debug(`❌ Missing: ${file} (${res.status})`, 'error');
          }
        })
        .catch(err => debug(`❌ Error: ${file} - ${err.message}`, 'error'));
    });
  }
  
  // Handle AR placement
  scene.addEventListener('click', function (evt) {
    if (scene.is('ar-mode')) {
      if (evt.detail.intersection) {
        const point = evt.detail.intersection.point;
        const hootyModel = document.querySelector('#hooty');
        if (hootyModel) {
          hootyModel.setAttribute('position', point);
          debug(`Placed at: ${JSON.stringify(point)}`, 'success');
        } else {
          debug('Hooty model not found for placement', 'error');
        }
      } else {
        debug('No intersection point found', 'warn');
      }
    } else {
      debug('Not in AR mode, placing in front of camera', 'log');
      const hootyModel = document.querySelector('#hooty');
      if (hootyModel) {
        hootyModel.setAttribute('position', { x: 0, y: -0.5, z: -1.5 });
      }
    }
  });
  
  // Remove any leftover hooty models
  const existingModels = document.querySelectorAll('#hooty');
  existingModels.forEach(model => {
    debug(`Removing leftover hooty model`, 'log');
    model.parentNode.removeChild(model);
  });
  
  // Initialize Botpress when script loads
  if (window.botpress) {
    initBotpress();
  } else {
    debug('Botpress not available yet, will try again later', 'warn');
    
    // Check periodically for Botpress availability
    const botpressCheckInterval = setInterval(() => {
      if (window.botpress) {
        debug('Botpress now available', 'success');
        initBotpress();
        clearInterval(botpressCheckInterval);
      }
    }, 1000);
    
    // Give up after 10 seconds
    setTimeout(() => {
      clearInterval(botpressCheckInterval);
      if (!botpressInitialized) {
        debug('Gave up waiting for Botpress after 10 seconds', 'error');
      }
    }, 10000);
  }
  
  // Start initialization processes
  createHootyModel();
  checkModelFiles();
  
  // Ensure chat toggle has high z-index
  chatToggle.style.zIndex = '10000';
  
  // Debug - double click to force chat
  chatToggle.addEventListener('dblclick', function() {
    debug('Double-clicked chat toggle - forcing display', 'warn');
    chatContainer.style.display = 'block';
    chatContainer.style.zIndex = '10000';
    
    // Try to force initialize Botpress
    if (window.botpress && !botpressInitialized) {
      initBotpress();
    }
    
    // Force open Botpress after a short delay
    setTimeout(() => {
      if (window.botpress && typeof window.botpress.open === 'function') {
        window.botpress.open();
        debug('Forced Botpress to open', 'success');
      }
    }, 500);
  });
});
