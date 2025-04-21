// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to key elements
  const scene = document.querySelector('a-scene');
  const arContent = document.querySelector('#ar-content');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  
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
    console.log('Setting up model with Happy Idle.glb');
    // Set the default idle animation
    hootModel.setAttribute('src', 'models/Happy Idle.glb');
    
    // Set up animation mixer (use empty string for clip to let it use default)
    hootModel.setAttribute('animation-mixer', {
      loop: 'repeat'
    });

    // Debug info about the model loading
    hootModel.addEventListener('model-loaded', (event) => {
      console.log('✅ Hooty model loaded successfully!');
      
      // Initialize the controller after model loads
      window.hootyController = new HootyController(hootModel);
      
      // Set up animation test buttons
      setupAnimationButtons();
    });
    
    hootModel.addEventListener('model-error', (error) => {
      console.error('❌ Error loading Hooty model:', error.detail);
    });
  } else {
    console.error('❌ Could not find #hooty element');
  }
  
  // Function to set up animation buttons
  function setupAnimationButtons() {
    const animButtons = document.querySelectorAll('.anim-button');
    if (animButtons.length === 0) {
      console.warn('No animation buttons found');
      return;
    }
    
    console.log(`Found ${animButtons.length} animation buttons`);
    
    // Update each animation button to trigger animations
    animButtons.forEach(button => {
      const animType = button.getAttribute('data-anim');
      console.log(`Setting up button for animation: ${animType}`);
      
      button.addEventListener('click', () => {
        console.log(`Animation button clicked: ${animType}`);
        if (window.hootyController) {
          window.hootyController.playAnimation(animType);
        } else {
          console.warn("Hooty controller not initialized");
        }
      });
    });
  }

  // Initialize Botpress
  function initBotpress() {
    if (window.botpress) {
      window.botpress.on("webchat:ready", () => {
        console.log("Webchat is ready!");
      });
      
      // Listen for user messages to trigger animations
      window.botpress.on("webchat:message:sent", (event) => {
        const userMessage = event.message?.text || "";
        console.log("User message sent:", userMessage);
        
        if (window.hootyController) {
          window.hootyController.reactToMessage(userMessage);
        }
      });
      
      // Listen for bot responses to trigger animations
      window.botpress.on("webchat:message:received", (event) => {
        const botResponse = event.message?.text || "";
        console.log("Bot message received:", botResponse);
        
        if (window.hootyController) {
          window.hootyController.reactToBotResponse(botResponse);
        }
      });
      
      // Initialize the webchat
      window.botpress.init({
        "botId": "0d3d94b4-0bdb-4bcc-9e35-e21194ed2c1e",
        "clientId": "44c58e23-012d-4aa6-9617-abb818a66b42",
        "hostUrl": "https://cdn.botpress.cloud/webchat/v2",
        "messagingUrl": "https://messaging.botpress.cloud",
        "webhookId": "44c58e23-012d-4aa6-9617-abb818a66b42",
        "configuration": {
          "composerPlaceholder": "Talk to Hooty...",
          "botName": "iHooty",
          "color": "#ffc53d",
          "variant": "solid",
          "themeMode": "light",
          "enableCookie": false,
          "externalAuthEnabled": false
        },
        "selector": "#webchat"
      });
    } else {
      console.error("Botpress not loaded!");
      setTimeout(initBotpress, 1000); // Retry after 1 second
    }
  }
  
  // Initialize Botpress after a short delay
  setTimeout(initBotpress, 2000);
  
  // Handle AR interactions
  scene.addEventListener('enter-vr', function() {
    // Make content visible when AR starts
    arContent.setAttribute('visible', true);
  });
  
  // Tap to place model
  scene.addEventListener('click', function(evt) {
    console.log("Scene clicked");
    
    // Try to place in AR if possible
    if (scene.is('ar-mode')) {
      console.log("AR mode is active");
      // Check if we have an intersection point
      if (evt.detail.intersection) {
        const point = evt.detail.intersection.point;
        hootModel.setAttribute('position', {
          x: point.x,
          y: point.y,
          z: point.z
        });
      } else {
        // Fallback placement
        hootModel.setAttribute('position', {
          x: 0,
          y: -0.5,
          z: -1.5
        });
      }
    } else {
      // Place in front of camera in non-AR mode
      hootModel.setAttribute('position', {
        x: 0,
        y: -0.5,
        z: -1.5
      });
    }
    
    // Make sure the model is visible
    arContent.setAttribute('visible', true);
  });
  
  // Test if model files exist
  const modelFiles = [
    'models/Baseball Milling Idle.glb',
    'models/Baseball Pitching.glb',
    'models/Baseball Strike.glb',
    'models/Baseball Umpire.glb',
    'models/Gangnam Style.glb',
    'models/Happy Idle.glb',
    'models/Northern Soul Spin Combo.glb',
    'models/Owl_Mascot_0409005910_texture.glb',
    'models/Salsa Dancing.glb',
    'models/Shuffling.glb',
    'models/Wave Hip Hop Dance.glb'
  ];
  
  modelFiles.forEach(file => {
    fetch(file)
      .then(response => {
        if (response.ok) {
          console.log(`✅ Model file exists: ${file}`);
        } else {
          console.error(`❌ Model file not found: ${file}. Status: ${response.status}`);
        }
      })
      .catch(err => {
        console.error(`❌ Error checking model ${file}:`, err);
      });
  });
});

// Enhanced HootyController for animations using separate .glb files
class HootyController {
  constructor(modelEntity) {
    this.modelEntity = modelEntity;
    this.currentAnimation = 'idle';
    this.animationQueue = [];
    this.isAnimating = false;
    
    console.log("HootyController initialized");
    
    // Define animations with their corresponding .glb files
    this.animations = {
      'idle': { 
        src: 'models/Happy Idle.glb',
        duration: 0, 
        loop: true 
      },
      'baseball-idle': { 
        src: 'models/Baseball Milling Idle.glb',
        duration: 5000, 
        loop: true 
      },
      'baseball-pitch': { 
        src: 'models/Baseball Pitching.glb',  
        duration: 3500, 
        loop: false 
      },
      'baseball-strike': { 
        src: 'models/Baseball Strike.glb',  
        duration: 3000, 
        loop: false 
      },
      'baseball-umpire': { 
        src: 'models/Baseball Umpire.glb',  
        duration: 3000, 
        loop: false 
      },
      'gangnam': { 
        src: 'models/Gangnam Style.glb',  
        duration: 6000, 
        loop: false 
      },
      'soul-spin': { 
        src: 'models/Northern Soul Spin Combo.glb',  
        duration: 5000, 
        loop: false 
      },
      'salsa': { 
        src: 'models/Salsa Dancing.glb',  
        duration: 5000, 
        loop: false 
      },
      'shuffle': { 
        src: 'models/Shuffling.glb',  
        duration: 5000, 
        loop: false 
      },
      'hip-hop': { 
        src: 'models/Wave Hip Hop Dance.glb',  
        duration: 5000, 
        loop: false 
      },
      'wave': { 
        src: 'models/Wave Hip Hop Dance.glb',  
        duration: 5000, 
        loop: false 
      },
      'dance': { 
        src: 'models/Gangnam Style.glb',  
        duration: 6000, 
        loop: false 
      },
      'heart': { 
        src: 'models/Salsa Dancing.glb',  
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
    
    console.log("Setting initial idle animation");
    // Initialize with idle animation
    this.playAnimation('idle');
  }
  
  // Check message for animation triggers
  checkForAnimationTriggers(message) {
    if (!message) return false;
    
    const lowercaseMsg = message.toLowerCase();
    console.log("Checking for triggers in:", lowercaseMsg);
    
    for (const [animation, triggers] of Object.entries(this.animationTriggers)) {
      if (triggers.some(trigger => lowercaseMsg.includes(trigger))) {
        console.log(`Found trigger for ${animation}`);
        this.playAnimation(animation);
        return true;
      }
    }
    return false;
  }
  
  // Play an animation by loading the corresponding .glb file
  playAnimation(animationName) {
    console.log(`Attempting to play animation: ${animationName}`);
    
    if (!this.animations[animationName]) {
      console.warn(`Animation "${animationName}" not found!`);
      return;
    }
    
    console.log(`Playing animation: ${animationName}`);
    
    // Add to queue if already animating
    if (this.isAnimating && animationName !== 'idle') {
      console.log(`Currently animating, adding ${animationName} to queue`);
      this.animationQueue.push(animationName);
      return;
    }
    
    // Set current animation
    this.currentAnimation = animationName;
    this.isAnimating = animationName !== 'idle';
    
    try {
      // Load the new model file
      const modelSrc = this.animations[animationName].src;
      console.log(`Setting model source to: ${modelSrc}`);
      this.modelEntity.setAttribute('src', modelSrc);
      
      // Apply animation mixer properties
      if (this.animations[animationName].loop) {
        console.log('Setting looping animation');
        this.modelEntity.setAttribute('animation-mixer', {
          loop: 'repeat'
        });
      } else {
        console.log('Setting non-looping animation');
        this.modelEntity.setAttribute('animation-mixer', {
          loop: 'once'
        });
      }
      
      // Make sure position, scale and rotation are preserved
      this.modelEntity.setAttribute('position', this.originalPosition);
      this.modelEntity.setAttribute('scale', this.originalScale);
      this.modelEntity.setAttribute('rotation', this.originalRotation);
      
      // If this is not a looping animation, schedule return to idle
      if (!this.animations[animationName].loop) {
        console.log(`Scheduling return to idle after ${this.animations[animationName].duration}ms`);
        setTimeout(() => {
          console.log('Animation complete, returning to idle or next queued animation');
          this.isAnimating = false;
          
          // Play next animation in queue if exists
          if (this.animationQueue.length > 0) {
            const nextAnimation = this.animationQueue.shift();
            console.log(`Playing next queued animation: ${nextAnimation}`);
            this.playAnimation(nextAnimation);
          } else {
            // Return to idle
            console.log('No more animations in queue, returning to idle');
            this.playAnimation('idle');
          }
        }, this.animations[animationName].duration);
      }
    } catch (err) {
      console.error("Error setting animation:", err);
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
