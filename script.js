// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get references to key elements
  const scene = document.querySelector('a-scene');
  const arContent = document.querySelector('#ar-content');
  const hootModel = document.querySelector('#hooty');
  const chatToggle = document.querySelector('#chat-toggle');
  const chatContainer = document.querySelector('#chat-container');
  
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
  
  // Enhanced HootyController for specific .glb animations
  class HootyController {
    constructor(modelEntity) {
      this.modelEntity = modelEntity;
      this.currentAnimation = 'idle';
      this.animationQueue = [];
      this.isAnimating = false;
      
      // Define animations - keeping these simpler for now
      this.animations = {
        'idle': { duration: 0, loop: true },
        'dance': { duration: 5000, loop: false },
        'wave': { duration: 3000, loop: false },
        'heart': { duration: 3500, loop: false }
      };
      
      // Keywords that trigger animations
      this.animationTriggers = {
        'dance': ['dance', 'dancing', 'move'],
        'wave': ['wave', 'hello', 'hi', 'hey', 'greet'],
        'heart': ['heart', 'love', 'like']
      };
      
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
    
    // Play an animation
    playAnimation(animationName) {
      if (!this.animations[animationName]) {
        console.warn(`Animation "${animationName}" not found!`);
        return;
      }
      
      console.log(`Playing animation: ${animationName}`);
      
      // Add to queue if already animating
      if (this.isAnimating && animationName !== 'idle') {
        this.animationQueue.push(animationName);
        return;
      }
      
      // Play the animation
      this.currentAnimation = animationName;
      
      try {
        this.modelEntity.setAttribute('animation-mixer', {
          clip: animationName,
          loop: this.animations[animationName].loop ? 'repeat' : 'once',
          timeScale: 1
        });
        
        // Handle non-looping animations
        if (!this.animations[animationName].loop) {
          this.isAnimating = true;
          
          // Return to idle after animation completes
          setTimeout(() => {
            this.isAnimating = false;
            
            // Play next animation in queue if exists
            if (this.animationQueue.length > 0) {
              const nextAnimation = this.animationQueue.shift();
              this.playAnimation(nextAnimation);
            } else {
              // Return to idle
              this.currentAnimation = 'idle';
              this.modelEntity.setAttribute('animation-mixer', {
                clip: 'idle',
                loop: 'repeat'
              });
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

  // Set up model loading and error handlers
  if (hootModel) {
    // Debug info about the model loading
    hootModel.addEventListener('model-loaded', (event) => {
      console.log('✅ Hooty model loaded successfully!');
      
      // Check for animation clips
      try {
        const mixer = hootModel.components['animation-mixer'].mixer;
        if (mixer) {
          console.log('Available animations:', 
            Object.keys(mixer._clips).map(name => name));
        }
      } catch (err) {
        console.warn("Couldn't access animation clips:", err);
      }
      
      // Initialize the controller after model loads
      window.hootyController = new HootyController(hootModel);
    });
    
    hootModel.addEventListener('model-error', (error) => {
      console.error('❌ Error loading Hooty model:', error.detail);
    });
  } else {
    console.error('❌ Could not find #hooty element');
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
  
  // Add debug button to show model without AR
  const debugButton = document.createElement('button');
  debugButton.innerHTML = 'Show Model';
  debugButton.style.position = 'fixed';
  debugButton.style.top = '10px';
  debugButton.style.right = '10px';
  debugButton.style.zIndex = 1001;
  debugButton.style.padding = '8px 16px';
  debugButton.style.backgroundColor = '#ffc53d';
  debugButton.style.border = 'none';
  debugButton.style.borderRadius = '4px';
  document.body.appendChild(debugButton);

  debugButton.addEventListener('click', function() {
    console.log("Debug button clicked - showing model");
    arContent.setAttribute('visible', true);
    hootModel.setAttribute('position', '0 -0.5 -2');
    
    // Test animation if controller exists
    if (window.hootyController) {
      window.hootyController.playAnimation('dance');
      setTimeout(() => {
        window.hootyController.playAnimation('idle');
      }, 5000);
    }
  });
  
  // Test if the model file exists
  fetch('models/Animation_Idle_02_withSkin.glb')
    .then(response => {
      if (response.ok) {
        console.log('✅ Model file exists!');
      } else {
        console.error('❌ Model file not found! Status:', response.status);
      }
    })
    .catch(err => {
      console.error('❌ Error checking model:', err);
    });
});
