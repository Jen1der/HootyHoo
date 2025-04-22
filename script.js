// Enhanced version of your script.js with better debugging and animation handling

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to key elements
  const scene = document.querySelector('a-scene');
  const arContent = document.querySelector('#ar-content');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  const debugPanel = document.querySelector('#debug-panel');
  
  // Debug function that ensures messages appear in the debug panel
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
    
    // Log to console
    console[type](message);
    
    // Add to debug panel if it exists
    if (debugPanel) {
      const logLine = document.createElement('div');
      logLine.textContent = `${prefix[type]} ${message}`;
      logLine.style.color = colors[type];
      debugPanel.appendChild(logLine);
      debugPanel.scrollTop = debugPanel.scrollHeight;
    }
  }
  
  // Update the Hooty model reference
  let hootModel = document.querySelector('#hooty');
  
  // Hide chat initially
  chatContainer.style.display = 'none';
  
  // Toggle chat visibility
  chatToggle.addEventListener('click', function() {
    if (chatContainer.style.display === 'none') {
      chatContainer.style.display = 'block';
    } else {
      chatContainer.style.display = 'none';
    }
  });
  
  // Make Hooty visible by default in non-AR mode
  arContent.setAttribute('visible', true);
  
  // Set up model loading and error handlers
  if (hootModel) {
    debug('Setting up model with HappyIdle.glb', 'log');
    // Set the default idle animation
    hootModel.setAttribute('src', 'models/HappyIdle.glb');
    
    // Set up animation mixer (use empty string for clip to let it use default)
    hootModel.setAttribute('animation-mixer', {
      loop: 'repeat'
    });

    // Debug info about the model loading
    hootModel.addEventListener('model-loaded', (event) => {
      debug('Hooty model loaded successfully!', 'success');
      
      // Check if the model has animations
      const mesh = hootModel.getObject3D('mesh');
      if (mesh && mesh.animations) {
        debug(`Model has ${mesh.animations.length} animation(s)`, 'success');
        
        // Log animation names if available
        mesh.animations.forEach((anim, index) => {
          debug(`Animation ${index}: ${anim.name}`, 'log');
        });
      } else {
        debug('Model has no animations in current state', 'warn');
      }
      
      // Initialize the controller after model loads
      window.hootyController = new HootyController(hootModel, debug);
      
      // Set up animation test buttons
      setupAnimationButtons();
    });
    
    hootModel.addEventListener('model-error', (error) => {
      debug(`Error loading Hooty model: ${error.detail}`, 'error');
    });
  } else {
    debug('Could not find #hooty element', 'error');
  }
  
  // Function to set up animation buttons
  function setupAnimationButtons() {
    const animButtons = document.querySelectorAll('.anim-button');
    if (animButtons.length === 0) {
      debug('No animation buttons found', 'warn');
      return;
    }
    
    debug(`Found ${animButtons.length} animation buttons`, 'success');
    
    // Update each animation button to trigger animations
    animButtons.forEach(button => {
      const animType = button.getAttribute('data-anim');
      debug(`Setting up button for animation: ${animType}`, 'log');
      
      button.addEventListener('click', () => {
        debug(`Animation button clicked: ${animType}`, 'success');
        if (window.hootyController) {
          debug(`Triggering animation: ${animType}`, 'log');
          window.hootyController.playAnimation(animType);
        } else {
          debug("Hooty controller not initialized", 'error');
          
          // Fallback initialization if controller doesn't exist
          if (hootModel) {
            debug("Creating fallback controller", 'warn');
            window.hootyController = new HootyController(hootModel, debug);
            window.hootyController.playAnimation(animType);
          }
        }
      });
    });
  }

  // Initialize Botpress
  function initBotpress() {
    if (window.botpress) {
      // Set up event listeners
      window.botpress.on("webchat:ready", () => {
        debug("Webchat is ready!", 'success');
        window.botpress.open();
      });
      
      // Listen for user messages to trigger animations
      window.botpress.on("webchat:message:sent", (event) => {
        const userMessage = event.message?.text || "";
        debug("User message sent: " + userMessage, 'log');
        
        if (window.hootyController) {
          window.hootyController.reactToMessage(userMessage);
        }
      });
      
      // Listen for bot responses to trigger animations
      window.botpress.on("webchat:message:received", (event) => {
        const botResponse = event.message?.text || "";
        debug("Bot message received: " + botResponse, 'log');
        
        if (window.hootyController) {
          window.hootyController.reactToBotResponse(botResponse);
        }
      });
      
      // Initialize the webchat with updated configuration
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
    } else {
      debug("Botpress not loaded!", 'error');
      setTimeout(initBotpress, 1000); // Retry after 1 second
    }
  }
  
  // Initialize Botpress after a short delay
  setTimeout(initBotpress, 2000);
  
  // Handle AR interactions
  scene.addEventListener('enter-vr', function() {
    // Make content visible when AR starts
    arContent.setAttribute('visible', true);
    debug('Entered AR/VR mode', 'success');
  });
  
  // Tap to place model
  scene.addEventListener('click', function(evt) {
    debug("Scene clicked", 'log');
    
    // Try to place in AR if possible
    if (scene.is('ar-mode')) {
      debug("AR mode is active", 'success');
      // Check if we have an intersection point
      if (evt.detail.intersection) {
        const point = evt.detail.intersection.point;
        hootModel.setAttribute('position', {
          x: point.x,
          y: point.y,
          z: point.z
        });
        debug(`Placed model at position: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}, z=${point.z.toFixed(2)}`, 'success');
      } else {
        // Fallback placement
        hootModel.setAttribute('position', {
          x: 0,
          y: -0.5,
          z: -1.5
        });
        debug('Used fallback position (no intersection)', 'warn');
      }
    } else {
      // Place in front of camera in non-AR mode
      hootModel.setAttribute('position', {
        x: 0,
        y: -0.5,
        z: -1.5
      });
      debug('Placed model in front of camera (non-AR)', 'log');
    }
    
    // Make sure the model is visible
    arContent.setAttribute('visible', true);
  });
  
  // Test if model files exist
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
      .then(response => {
        if (response.ok) {
          debug(`Model file exists: ${file}`, 'success');
        } else {
          debug(`Model file not found: ${file}. Status: ${response.status}`, 'error');
        }
      })
      .catch(err => {
        debug(`Error checking model ${file}: ${err.message}`, 'error');
      });
  });
});

// Enhanced HootyController for animations using separate .glb files
class HootyController {
  constructor(modelEntity, debugFn = console.log) {
    this.modelEntity = modelEntity;
    this.debug = debugFn;
    this.currentAnimation = 'idle';
    this.animationQueue = [];
    this.isAnimating = false;
    this.loadingModel = false;
    
    this.debug("HootyController initialized", 'success');
    
    // Define animations with their corresponding .glb files
    this.animations = {
      'idle': { 
        src: 'models/HappyIdle.glb',
        duration: 0, 
        loop: true 
      },
      'baseball-idle': { 
        src: 'models/BaseballMillingIdle.glb',
        duration: 5000, 
        loop: true 
      },
      'baseball-pitch': { 
        src: 'models/BaseballPitching.glb',  
        duration: 3500, 
        loop: false 
      },
      'baseball-strike': { 
        src: 'models/BaseballStrike.glb',  
        duration: 3000, 
        loop: false 
      },
      'baseball-umpire': { 
        src: 'models/BaseballUmpire.glb',  
        duration: 3000, 
        loop: false 
      },
      'gangnam': { 
        src: 'models/GangnamStyle.glb',  
        duration: 6000, 
        loop: false 
      },
      'soul-spin': { 
        src: 'models/NorthernSoulSpinCombo.glb',  
        duration: 5000, 
        loop: false 
      },
      'salsa': { 
        src: 'models/SalsaDancing.glb', 
        duration: 5000, 
        loop: false 
      },
      'shuffle': { 
        src: 'models/Shuffling.glb',  
        duration: 5000, 
        loop: false 
      },
      'hip-hop': { 
        src: 'models/WaveHipHopDance.glb',  
        duration: 5000, 
        loop: false 
      },
      'wave': { 
        src: 'models/WaveHipHopDance.glb',  
        duration: 5000, 
        loop: false 
      },
      'dance': { 
        src: 'models/GangnamStyle.glb',  
        duration: 6000, 
        loop: false 
      },
      'heart': { 
        src: 'models/SalsaDancing.glb',  
        duration: 5000, 
        loop: false 
      }
    };
    
    // Keywords that trigger animations
    this.animationTriggers = {
      'dance': ['dance', 'dancing', 'move'],
      'wave': ['wave', 'hello', 'hi', 'hey', 'greet'],
      'heart': ['heart', 'love', 'like'],
      'gangnam': ['gangnam', 'style', 'k-pop', 'kpop'],
      'salsa': ['salsa', 'latin', 'dance'],
      'shuffle': ['shuffle', 'shuffling'],
      'baseball-pitch': ['pitch', 'throw', 'baseball', 'ball'],
      'baseball-strike': ['strike', 'hit', 'swing'],
      'baseball-umpire': ['umpire', 'out', 'safe'],
      'hip-hop': ['hip hop', 'hip-hop', 'rap'],
      'soul-spin': ['spin', 'twirl', 'soul']
    };
    
    // Store original position, scale and rotation
    this.originalPosition = this.modelEntity.getAttribute('position');
    this.originalScale = this.modelEntity.getAttribute('scale');
    this.originalRotation = this.modelEntity.getAttribute('rotation');
    
    this.debug("Setting initial idle animation", 'log');
    // Initialize with idle animation
    this.playAnimation('idle');
    
    // Set up model-loaded event listener to detect when models change
    this.modelEntity.addEventListener('model-loaded', () => {
      this.debug("Model loaded event triggered", 'success');
      this.loadingModel = false;
      
      // Check loaded model for animations
      const mesh = this.modelEntity.getObject3D('mesh');
      if (mesh && mesh.animations) {
        this.debug(`Loaded model has ${mesh.animations.length} animation(s)`, 'success');
        
        // Log animation names
        mesh.animations.forEach((anim, index) => {
          this.debug(`Animation ${index}: ${anim.name}`, 'log');
        });
      } else {
        this.debug('Loaded model has no animations', 'warn');
      }
    });
  }
  
  // Check message for animation triggers
  checkForAnimationTriggers(message) {
    if (!message) return false;
    
    const lowercaseMsg = message.toLowerCase();
    this.debug("Checking for triggers in: " + lowercaseMsg, 'log');
    
    for (const [animation, triggers] of Object.entries(this.animationTriggers)) {
      if (triggers.some(trigger => lowercaseMsg.includes(trigger))) {
        this.debug(`Found trigger for ${animation}`, 'success');
        this.playAnimation(animation);
        return true;
      }
    }
    return false;
  }
  
  // Play an animation by loading the corresponding .glb file
  playAnimation(animationName) {
    this.debug(`Attempting to play animation: ${animationName}`, 'log');
    
    if (!this.animations[animationName]) {
      this.debug(`Animation "${animationName}" not found!`, 'error');
      return;
    }
    
    this.debug(`Playing animation: ${animationName}`, 'success');
    
    // If we're currently loading a model, queue this animation
    if (this.loadingModel) {
      this.debug(`Currently loading a model, adding ${animationName} to queue`, 'warn');
      this.animationQueue.push(animationName);
      return;
    }
    
    // Add to queue if already animating
    if (this.isAnimating && animationName !== 'idle') {
      this.debug(`Currently animating, adding ${animationName} to queue`, 'log');
      this.animationQueue.push(animationName);
      return;
    }
    
    // Set current animation
    this.currentAnimation = animationName;
    this.isAnimating = animationName !== 'idle';
    this.loadingModel = true;
    
    try {
      // Load the new model file
      const modelSrc = this.animations[animationName].src;
      this.debug(`Setting model source to: ${modelSrc}`, 'log');
      
      // Force reload by temporarily clearing the src
      this.modelEntity.setAttribute('src', '');
      
      // Store current position, scale and rotation
      const currentPosition = this.modelEntity.getAttribute('position');
      const currentScale = this.modelEntity.getAttribute('scale');
      const currentRotation = this.modelEntity.getAttribute('rotation');
      
      // Wait a small amount of time before setting the new source
      setTimeout(() => {
        // Set the new source
        this.modelEntity.setAttribute('src', modelSrc);
        
        // Wait for the model to load
        setTimeout(() => {
          // Apply animation mixer properties
          if (this.animations[animationName].loop) {
            this.debug('Setting looping animation', 'log');
            this.modelEntity.setAttribute('animation-mixer', {
              loop: 'repeat'
            });
          } else {
            this.debug('Setting non-looping animation', 'log');
            this.modelEntity.setAttribute('animation-mixer', {
              loop: 'once',
              clampWhenFinished: true
            });
          }
          
          // Make sure position, scale and rotation are preserved
          this.modelEntity.setAttribute('position', currentPosition);
          this.modelEntity.setAttribute('scale', currentScale);
          this.modelEntity.setAttribute('rotation', currentRotation);
          
          this.loadingModel = false;
          
          // If this is not a looping animation, schedule return to idle
          if (!this.animations[animationName].loop) {
            this.debug(`Scheduling return to idle after ${this.animations[animationName].duration}ms`, 'log');
            setTimeout(() => {
              this.debug('Animation complete, returning to idle or next queued animation', 'success');
              this.isAnimating = false;
              
              // Play next animation in queue if exists
              if (this.animationQueue.length > 0) {
                const nextAnimation = this.animationQueue.shift();
                this.debug(`Playing next queued animation: ${nextAnimation}`, 'log');
                this.playAnimation(nextAnimation);
              } else {
                // Return to idle
                this.debug('No more animations in queue, returning to idle', 'log');
                this.playAnimation('idle');
              }
            }, this.animations[animationName].duration);
          }
        }, 500); // Wait 500ms for model to fully load
      }, 100);
    } catch (err) {
      this.debug(`Error setting animation: ${err.message}`, 'error');
      this.loadingModel = false;
    }
  }
  
  // React to user message
  reactToMessage(message) {
    return this.checkForAnimationTriggers(message);
  }
  
  // React to bot response
  reactToBotResponse(response) {
    return this.checkForAnimationTriggers(response);
  }
}
