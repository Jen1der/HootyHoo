document.addEventListener('DOMContentLoaded', function () {
  const scene = document.querySelector('a-scene');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  const debugPanel = document.getElementById('debug-panel');
  const debugToggle = document.getElementById('debug-toggle');
  
  // Debug utility function
  function debug(message, type = 'log') {
    console[type](message);
    
    if (debugPanel) {
      const msgElement = document.createElement('div');
      msgElement.textContent = message;
      msgElement.classList.add(type);
      debugPanel.appendChild(msgElement);
      
      // Auto-scroll to bottom
      debugPanel.scrollTop = debugPanel.scrollHeight;
      
      // Limit debug entries
      while (debugPanel.children.length > 50) {
        debugPanel.removeChild(debugPanel.firstChild);
      }
    }
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

      const position = this.model.getAttribute('position');
      const scale = this.model.getAttribute('scale');
      const rotation = this.model.getAttribute('rotation');

      const existingModels = document.querySelectorAll('#hooty');
      existingModels.forEach(model => {
        this.debug(`Removing existing hooty model`, 'log');
        model.parentNode.removeChild(model);
      });

      const newModel = document.createElement('a-entity');
      newModel.setAttribute('id', 'hooty');
      newModel.setAttribute('gltf-model', `models/${animFile}`);
      newModel.setAttribute('position', position);
      newModel.setAttribute('scale', scale);
      newModel.setAttribute('rotation', rotation);
      newModel.setAttribute('visible', 'true');

      // Add the new model to the scene
      const arContent = document.querySelector('#ar-content') || scene;
      arContent.appendChild(newModel);
      
      // Update the model reference
      this.model = newModel;
      
      // Listen for events on the new model
      newModel.addEventListener('model-loaded', () => {
        this.debug(`✅ Loaded: ${animFile}`, 'success');
        newModel.setAttribute('animation-mixer', { loop: 'repeat' });
        
        // Set timeout to return to idle after duration
        if (animFile !== 'HappyIdle.glb') {
          this.animationTimeout = setTimeout(() => {
            this.playAnimation('HappyIdle.glb');
            this.debug('Returning to idle animation', 'log');
          }, duration);
        }
      });
      
      newModel.addEventListener('model-error', (err) => {
        this.debug(`Animation model error: ${err.detail || 'unknown error'}`, 'error');
      });
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

  // Improved chat toggle behavior
  chatToggle.addEventListener('click', () => {
    debug("Chat toggle clicked", 'log');
    if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
      chatContainer.style.display = 'block';
      
      // Try to open Botpress chat
      if (window.botpress && typeof window.botpress.open === 'function') {
        try {
          window.botpress.open();
          debug("Opening Botpress chat", 'success');
        } catch (err) {
          debug(`Error opening Botpress: ${err.message}`, 'error');
        }
      }
    } else {
      chatContainer.style.display = 'none';
      
      // Try to close Botpress chat
      if (window.botpress && typeof window.botpress.close === 'function') {
        try {
          window.botpress.close();
          debug("Closing Botpress chat", 'log');
        } catch (err) {
          debug(`Error closing Botpress: ${err.message}`, 'error');
        }
      }
    }
  });

  // Remove any leftover hooty models from previous sessions
  const existingModels = document.querySelectorAll('#hooty');
  existingModels.forEach(model => {
    debug(`Removing leftover hooty model`, 'log');
    model.parentNode.removeChild(model);
  });

  // Create a fresh Hooty model
  createHootyModel();

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
  
  // Setup Botpress event listeners
  function setupBotpressEvents() {
    if (window.botpress) {
      debug("Setting up Botpress event listeners", 'log');
      
      window.botpress.on("webchat:ready", () => {
        debug("✅ Botpress webchat ready!", 'success');
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
    } else {
      debug("Botpress not available yet for event setup", 'warn');
      setTimeout(setupBotpressEvents, 1000);
    }
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

  // Start initialization processes
  setTimeout(checkModelFiles, 1000);
  setTimeout(setupBotpressEvents, 1000);
});
