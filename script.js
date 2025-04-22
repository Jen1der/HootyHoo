document.addEventListener('DOMContentLoaded', function () {
  const scene = document.querySelector('a-scene');
  const arContent = document.querySelector('#ar-content');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  const debugPanel = document.getElementById('debug-panel');
  let hootModel = document.querySelector('#hooty');

  class HootyController {
  constructor(model, debugFn) {
    this.model = model;
    this.debug = debugFn || console.log;
    this.debug("HootyController initialized", 'success');
  }
  
  playAnimation(animFile) {
    this.debug(`Playing animation: ${animFile}`, 'log');
    this.model.setAttribute('src', `models/${animFile}`);
    this.model.setAttribute('animation-mixer', { clip: '*', loop: 'repeat' });
  }
  
  reactToMessage(message) {
    this.debug(`Reacting to message: ${message}`, 'log');
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('dance')) this.playAnimation('NorthernSoulSpinCombo.glb');
    else if (lowerMsg.includes('wave')) this.playAnimation('WaveHipHopDance.glb');
    else if (lowerMsg.includes('gangnam')) this.playAnimation('GangnamStyle.glb');
    else if (lowerMsg.includes('salsa')) this.playAnimation('SalsaDancing.glb');
    else if (lowerMsg.includes('baseball')) this.playAnimation('BaseballPitching.glb');
    else if (lowerMsg.includes('hip-hop') || lowerMsg.includes('hip hop')) this.playAnimation('Shuffling.glb');
  }
  
  reactToBotResponse(message) {
    // Simple implementation - expand as needed
    this.debug(`Bot said: ${message}`, 'log');
  }
}
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

  chatContainer.style.display = 'none';
  chatToggle.addEventListener('click', () => {
    chatContainer.style.display = (chatContainer.style.display === 'none') ? 'block' : 'none';
  });

  arContent.setAttribute('visible', true);

  // Setup hooty
  if (hootModel) {
    debug('Loading default idle model (HappyIdle.glb)', 'log');
    hootModel.setAttribute('src', 'models/HappyIdle.glb');
    hootModel.setAttribute('animation-mixer', { loop: 'repeat' });

    hootModel.addEventListener('model-loaded', () => {
      debug('Hooty loaded successfully!', 'success');
      window.hootyController = new HootyController(hootModel, debug);
      setupAnimationButtons();
    });

    hootModel.addEventListener('model-error', (err) => {
      debug(`Model load error: ${err.detail}`, 'error');
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

  // Botpress init
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
    } else {
      debug("Botpress not loaded yet, retrying...", 'warn');
      setTimeout(initBotpress, 1000);
    }
  }

  setTimeout(initBotpress, 2000);

  scene.addEventListener('click', function (evt) {
    if (scene.is('ar-mode')) {
      if (evt.detail.intersection) {
        const point = evt.detail.intersection.point;
        hootModel.setAttribute('position', point);
        debug(`Placed at: ${JSON.stringify(point)}`, 'success');
      } else {
        hootModel.setAttribute('position', { x: 0, y: -0.5, z: -1.5 });
        debug('Fallback AR position set', 'warn');
      }
    } else {
      hootModel.setAttribute('position', { x: 0, y: -0.5, z: -1.5 });
      debug('Placed in front of camera (non-AR)', 'log');
    }
    arContent.setAttribute('visible', true);
  });

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
  modelFiles.forEach(file => {
    fetch(file)
      .then(res => res.ok ? debug(`✅ Found: ${file}`, 'success') : debug(`❌ Missing: ${file}`, 'error'))
      .catch(err => debug(`❌ Error: ${file} - ${err.message}`, 'error'));
  });
});
function initBotpress() {
  if (typeof window.botpress !== 'undefined') {
    debug("Botpress object found, initializing...", 'log');
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
      
      // Set up event handlers after successful init
      window.botpress.on("webchat:ready", () => {
        debug("Botpress chat ready", 'success');
        window.botpress.open();
      });

      window.botpress.on("webchat:message:sent", (event) => {
        const msg = event.message?.text || "";
        debug(`User: ${msg}`, 'log');
        if (window.hootyController) window.hootyController.reactToMessage(msg);
      });

      window.botpress.on("webchat:message:received", (event) => {
        const msg = event.message?.text || "";
        debug(`Bot: ${msg}`, 'log');
        if (window.hootyController) window.hootyController.reactToBotResponse(msg);
      });
      
    } catch (e) {
      debug(`Botpress init error: ${e.message}`, 'error');
    }
  } else {
    debug("Botpress not loaded yet, retrying in 2 seconds...", 'warn');
    setTimeout(initBotpress, 2000);
  }
}

// Start trying to initialize Botpress sooner
setTimeout(initBotpress, 1000);

// Add this function to your script.js
function testModelAccess() {
  const testModel = 'models/HappyIdle.glb';
  debug(`Testing access to model: ${testModel}`, 'log');
  
  fetch(testModel)
    .then(response => {
      if (!response.ok) {
        debug(`Failed to fetch ${testModel}: HTTP ${response.status}`, 'error');
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      const size = Math.round(blob.size / 1024);
      debug(`Successfully loaded ${testModel} (${size} KB)`, 'success');
      
      // Try to create a model URL to see if it's valid
      const modelUrl = URL.createObjectURL(blob);
      debug(`Created model URL: ${modelUrl}`, 'success');
      
      // Attempt to load this verified model
      const hootyModel = document.querySelector('#hooty');
      hootyModel.setAttribute('src', modelUrl);
    })
    .catch(error => {
      debug(`Error accessing model: ${error.message}`, 'error');
    });
}

// Call this function after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Your existing code...
  
  // Add this call
  setTimeout(testModelAccess, 1000);
});
