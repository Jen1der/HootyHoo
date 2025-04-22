document.addEventListener('DOMContentLoaded', function () {
  const scene = document.querySelector('a-scene');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  const debugPanel = document.getElementById('debug-panel');
  const debugToggle = document.getElementById('debug-toggle');
  
  // Toggle debug panel visibility
  debugToggle.addEventListener('click', function() {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
  });
  debugPanel.style.display = 'none'; // Initially hidden

  // Debug function
  function debug(message, type = 'log') {
    const colors = {
      log: '#ffffff',
      warn: '#ffaa00',
      error: '#ff5555',
      success: '#55ff55'
    };
    const prefix = {
      log: '📝',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    };

    console[type](message);
    if (debugPanel) {
      const logLine = document.createElement('div');
      logLine.textContent = `${prefix[type]} ${message}`;
      logLine.style.color = colors[type];
      debugPanel.appendChild(logLine);
      debugPanel.scrollTop = debugPanel.scrollHeight;
    }
  }

  // Hooty Controller Class
  class HootyController {
    constructor(model, debugFunction) {
      this.model = model;
      this.debug = debugFunction || console.log;
      this.currentAnimation = 'HappyIdle.glb';
      this.animationTimeout = null;
      this.debug('HootyController initialized', 'success');
    }
    
    playAnimation(animFile, duration = 5000) {
      this.debug(`Playing animation: ${animFile}`, 'log');
      this.currentAnimation = animFile;
      
      // Clear any existing animation timeout
      if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
      }
      
      // Get the old model
      const oldModel = this.model;
      
      // Create new model with the animation file
      const newModel = document.createElement('a-entity');
      newModel.setAttribute('id', 'hooty');
      newModel.setAttribute('gltf-model', `models/${animFile}`);
      newModel.setAttribute('position', oldModel.getAttribute('position'));
      newModel.setAttribute('scale', oldModel.getAttribute('scale'));
      newModel.setAttribute('rotation', oldModel.getAttribute('rotation'));
      newModel.setAttribute('animation-mixer', 'loop: repeat');
      newModel.setAttribute('visible', 'true');
      
      // Replace old model with new one
      oldModel.parentNode.replaceChild(newModel, oldModel);
      
      // Update the model reference
      this.model = newModel;
      
      // Listen for events on the new model
      newModel.addEventListener('model-loaded', () => {
        this.debug(`Animation model loaded: ${animFile}`, 'success');
      });
      
      newModel.addEventListener('model-error', (err) => {
        this.debug(`Animation model error: ${err.detail || 'unknown error'}`, 'error');
      });
      
      // Set timeout to return to idle after duration
      if (animFile !== 'HappyIdle.glb') {
        this.animationTimeout = setTimeout(() => {
          this.playAnimation('HappyIdle.glb');
          this.debug('Returning to idle animation', 'log');
        }, duration);
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

  // Toggle chat visibility
  chatContainer.style.display = 'none';
  chatToggle.addEventListener('click', () => {
    chatContainer.style.display = (chatContainer.style.display === 'none') ? 'block' : 'none';
  });

  // Initialize Hooty
  let hootModel = document.querySelector('#hooty');
  if (hootModel) {
    debug('Hooty model found in scene', 'success');
    window.hootyController = new HootyController(hootModel, debug);
    setupAnimationButtons();
  } else {
    debug('Hooty model not found, creating one', 'warn');
    createHootyModel();
  }

  function createHootyModel() {
    hootModel = document.createElement('a-entity');
    hootModel.setAttribute('id', 'hooty');
    hootModel.setAttribute('gltf-model', 'models/HappyIdle.glb');
    hootModel.setAttribute('position', '0 0 -3');
    hootModel.setAttribute('scale', '0.5 0.5 0.5');
    hootModel.setAttribute('animation-mixer', 'loop: repeat');
    hootModel.setAttribute('visible', 'true');
    
    scene.appendChild(hootModel);
    
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
  
  // Initialize Botpress chat
  function initBotpress() {
    if (window.botpress) {
      window.botpress.on("webchat:ready", () => {
        debug("Botpress chat ready", 'success');
        window.botpress.open();
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

      try {
        window.botpress.init({
          botId: "0d3d94b4-0bdb-4bcc-9e35-e21194ed2c1e",
          clientId: "44c58e23-012d-4aa6-9617-abb818a66b42",
          selector: "#webchat",
          configuration: {
            composerPlaceholder: "Let's go, Hoots!",
            botName: "iHooty",
            color: "#ffc53d",
            variant: "solid",
            themeMode: "light"
          }
        });
        debug("Botpress initialized", 'success');
      } catch (e) {
        debug(`Botpress init error: ${e.message}`, 'error');
        setTimeout(initBotpress, 2000);
      }
    } else {
      debug("Botpress not loaded yet, retrying...", 'warn');
      setTimeout(initBotpress, 2000);
    }
  }

  // Handle AR placement
  scene.addEventListener('click', function (evt) {
    if (scene.is('ar-mode')) {
      if (evt.detail.intersection) {
        const point = evt.detail.intersection.point;
        hootModel = document.querySelector('#hooty');
        if (hootModel) {
          hootModel.setAttribute('position', point);
          debug(`Placed at: ${JSON.stringify(point)}`, 'success');
        } else {
          debug('Hooty model not found for placement', 'error');
        }
      } else {
        debug('No intersection point found', 'warn');
      }
    } else {
      debug('Not in AR mode, placing in front of camera', 'log');
      hootModel = document.querySelector('#hooty');
      if (hootModel) {
        hootModel.setAttribute('position', { x: 0, y: -0.5, z: -1.5 });
      }
    }
  });

  // Start initialization processes
  setTimeout(checkModelFiles, 1000);
  setTimeout(initBotpress, 2000);
});
