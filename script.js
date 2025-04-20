const params = new URL(window.location.href).searchParams;
const configParams = params.get("config");
let config = {};

fetch('models/Animation_Idle_02_withSkin.glb')
  .then(response => {
    if (response.ok) console.log('Model file exists!');
    else console.error('Model file not found!');
  })
  .catch(err => console.error('Error checking model:', err));

try {
  if (!configParams) {
    throw "No config passed";
  }
  Object.assign(config, tryDecode(configParams));
  window.botpress.on("webchat:ready", () => {
    window.botpress.open();
  });
  window.botpress.init({
    ...config,
    selector: "#webchat"
  });
} catch (err) {
  showError(`Could not initialize webchat: ${err}`);
}

function resize_small() {
  document.querySelector("#webchat").style.height = "400px";
  document.querySelector("#webchat").style.width = "400px";
}

function resize_medium() {
  document.querySelector("#webchat").style.height = "600px";
  document.querySelector("#webchat").style.width = "500px";
}

function resize_large() {
  document.querySelector("#webchat").style.height = "1000px";
  document.querySelector("#webchat").style.width = "600px";
}

function send_message() {
  const input = document.getElementById("message");
  if (input.value.trim() === "") return;

  window.botpressWebChat.sendEvent({ type: "message", payload: { text: input.value } });
}

function send_event() {
  window.botpressWebChat.sendEvent({
    type: "webchat:trigger"
  });
}

function change_theme() {
  const colors = [
    "#d6409f", "#3a8ed6", "#f94d4d", "#42d697", 
    "#f2c14e", "#9354e2", "#e64f5e", "#5ea4a4", 
    "#c35020", "#7a3e9d"
  ];
  const variants = ["soft", "solid"];
  const themes = ["light", "dark"];

  if (window.botpress.initialized) {
    try {
      window.botpress.fabIframe?.remove();
      window.botpress.webchatIframe?.remove();
    } catch (err) {
      console.warn("Error removing Botpress elements:", err);
    }

    window.botpress.initialized = false;
    window.botpress.init({
      ...window.botpress,
      configuration: {
        ...window.botpress.configuration,
        color: pickRandom(colors),
        variant: pickRandom(variants),
        themeMode: pickRandom(themes)
      },
      selector: "#webchat"
    });
  }
}

window.botpress.on("*", (event) => {
  const eventsEl = document.getElementById("events");
  if (eventsEl) {
    eventsEl.value += "\n" + JSON.stringify(event) + "\n";
    eventsEl.scrollTop = eventsEl.scrollHeight;
  }
});

window.botpress.on("webchat:ready", () => {
    console.log("Botpress Webchat is ready!");
    window.botpress.open();  // Open chat on load
});

window.botpress.init({
    botId: "0d3d94b4-0bdb-4bcc-9e35-e21194ed2c1e",
    clientId: "44c58e23-012d-4aa6-9617-abb818a66b42",
    selector: "#webchat",
    configuration: {
        composerPlaceholder: "Let's go, Hoots!",
        botName: "iHooty",
        color: "#ffc53d",
        themeMode: "light",
        enableCookie: false,  // ❌ Disable third-party cookies
        externalAuthEnabled: false, // ❌ Prevents cross-domain auth issues
    }
});


function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function showError(error) {
  const el = document.getElementById("error");
  if (el) {
    el.style.display = "block";
    el.innerText = error;
  }
}

let check = setInterval(function () {
  if (window.botpress.initialized) {
    const el = document.getElementById("success");
    if (el) {
      el.style.display = "block";
      el.innerText = "Initialized: " + window.botpress.botId;
    }
    clearInterval(check);
  }
}, 500);

function tryDecode(str) {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch (e1) {
    try {
      return JSON.parse(atob(str));
    } catch (e2) {
      console.warn("Decoding failed:", e1, e2);
      return {};
    }
  }
}

// Wait for the Botpress script to load before initializing
setTimeout(() => {
    if (window.botpress) {
        window.botpress.on("webchat:ready", () => {
            window.botpress.open();
        });

        window.botpress.init({
            botId: "0d3d94b4-0bdb-4bcc-9e35-e21194ed2c1e",
            clientId: "44c58e23-012d-4aa6-9617-abb818a66b42",
            selector: "#webchat",
            configuration: {
                composerPlaceholder: "Let's go, Hoots!",
                botName: "iHooty",
                color: "#ffc53d",
                themeMode: "light",
                enableCookie: false,  // Disable third-party cookies
                externalAuthEnabled: false
            }
        });
    } else {
        console.error("Botpress failed to load.");
    }
}, 3000); // Delay 3 seconds to ensure script loads

// Animation controller for Hooty
class HootyController {
  constructor(modelEntity) {
    this.modelEntity = modelEntity;
    this.currentAnimation = 'idle';
    this.animationQueue = [];
    this.isAnimating = false;
    
    // Define animation clips and their durations (in ms)
    this.animations = {
      'idle': { duration: 0, loop: true },      // Default state, continuous loop
      'dance': { duration: 5000, loop: false }, // Dance for 5 seconds
      'wave': { duration: 2000, loop: false },  // Wave for 2 seconds
      'jump': { duration: 1500, loop: false },  // Jump for 1.5 seconds
      'cheer': { duration: 3000, loop: false }, // Cheer for 3 seconds
      'pitch': { duration: 2500, loop: false }  // Pitching motion for 2.5 seconds
    };
    
    // Keywords that trigger animations
    this.animationTriggers = {
      'dance': ['dance', 'dancing', 'move'],
      'wave': ['wave', 'hello', 'hi', 'hey'],
      'jump': ['jump', 'hop', 'excited'],
      'cheer': ['cheer', 'celebrate', 'hooray', 'yay', 'win'],
      'pitch': ['pitch', 'throw', 'baseball']
    };
  }
  
  // Check message for animation triggers
  checkForAnimationTriggers(message) {
    const lowercaseMsg = message.toLowerCase();
    
    for (const [animation, triggers] of Object.entries(this.animationTriggers)) {
      if (triggers.some(trigger => lowercaseMsg.includes(trigger))) {
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
    
    // Add to queue if already animating
    if (this.isAnimating && !this.animations[animationName].loop) {
      this.animationQueue.push(animationName);
      return;
    }
    
    // Play the animation
    this.currentAnimation = animationName;
    this.modelEntity.setAttribute('animation-mixer', {
      clip: animationName,
      loop: this.animations[animationName].loop ? 'repeat' : 'once'
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
  }
  
  // React to user message
  reactToMessage(message) {
    return this.checkForAnimationTriggers(message);
  }
  
  // React to bot response
  reactToBotResponse(response) {
    // Bot responses can also trigger animations
    return this.checkForAnimationTriggers(response);
  }
}

// Usage in your main script:
const hootModel = document.querySelector('#hooty');
const hootyController = new HootyController(hootModel);

// Connect to Botpress messages
window.botpress.on("webchat:message:sent", (event) => {
  const userMessage = event.message?.text || "";
  hootyController.reactToMessage(userMessage);
});

window.botpress.on("webchat:message:received", (event) => {
  const botResponse = event.message?.text || "";
  hootyController.reactToBotResponse(botResponse);
});

// Add model loading check
hootModel.addEventListener('model-loaded', () => {
  console.log('Hooty model loaded successfully!');
  // List available animations
  const animationMixer = hootModel.components['animation-mixer'];
  if (animationMixer && animationMixer.mixer) {
    console.log('Available animations:', 
      Object.keys(animationMixer.mixer._clips).map(name => name));
  }
});

hootModel.addEventListener('model-error', (error) => {
  console.error('Error loading Hooty model:', error);
});

document.querySelector('#hooty').addEventListener('model-loaded', () => {
  console.log('Model loaded successfully');
});

document.querySelector('#hooty').addEventListener('model-error', (error) => {
  console.error('Error loading model:', error);
});
// Add a debug button to show the model regardless of AR
const debugButton = document.createElement('button');
debugButton.innerHTML = 'Show Model';
debugButton.style.position = 'fixed';
debugButton.style.top = '10px';
debugButton.style.right = '10px';
debugButton.style.zIndex = 1001;
document.body.appendChild(debugButton);

debugButton.addEventListener('click', function() {
  arContent.setAttribute('visible', true);
  hootModel.setAttribute('position', '0 0 -2');
});
// Add this to your scene
scene.setAttribute('webxr', 'requiredFeatures: hit-test');

// Update your tap handling
scene.addEventListener('click', function (evt) {
  const xrSession = scene.renderer.xr.getSession();
  
  if (xrSession) {
    // Place the model where the user tapped
    const point = evt.detail.intersection.point;
    hootModel.setAttribute('position', {
      x: point.x,
      y: point.y,
      z: point.z
    });
    arContent.setAttribute('visible', true);
  }
});

scene.addEventListener('ar-hit-test-start', () => {
  console.log('AR hit test started');
});

scene.addEventListener('ar-hit-test-end', () => {
  console.log('AR hit test ended');
});

// Add this to your scene
scene.setAttribute('webxr', 'requiredFeatures: hit-test');

// Update your tap handling
scene.addEventListener('click', function (evt) {
  const xrSession = scene.renderer.xr.getSession();
  
  if (xrSession) {
    // Place the model where the user tapped
    const point = evt.detail.intersection.point;
    hootModel.setAttribute('position', {
      x: point.x,
      y: point.y,
      z: point.z
    });
    arContent.setAttribute('visible', true);
  }
});
// Add right before the closing </script> tag in your body
document.addEventListener('DOMContentLoaded', function() {
  const modelPath = './models/Animation_Idle_02_withSkin.glb';
  console.log('Attempting to load model from:', new URL(modelPath, window.location.href).href);
  
  // Test if the file exists
  fetch(modelPath)
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
    
  // Add event listeners for the model loading
  const hootModel = document.querySelector('#hooty');
  if (hootModel) {
    hootModel.addEventListener('model-loaded', () => {
      console.log('✅ Hooty model loaded successfully!');
    });
    
    hootModel.addEventListener('model-error', (error) => {
      console.error('❌ Error loading Hooty model:', error);
    });
  } else {
    console.error('❌ Could not find #hooty element');
  }
});

const modelEl = document.querySelector('#hooty');

// Add these event listeners
modelEl.addEventListener('model-loaded', function(e) {
  console.log('Model loaded successfully!', e);
});

modelEl.addEventListener('model-error', function(e) {
  console.error('Error loading model:', e);
});
// Add this function to your JavaScript to list available animations when the model loads
function listAvailableAnimations() {
  const hootModel = document.querySelector('#hooty');
  
  hootModel.addEventListener('model-loaded', (event) => {
    console.log('✅ Hooty model loaded successfully!');
    
    // Access the model's animation mixer
    const mixer = hootModel.components['animation-mixer'].mixer;
    if (mixer) {
      // Log all available animation clips
      console.log('Available animations:', Object.keys(mixer._clips));
      
      // Now we know exactly what animation names to use
      const availableClips = Object.keys(mixer._clips);
      
      // Update your HootyController with the actual clip names from your model
      if (window.hootyController) {
        // Match your animation names to the actual clips
        // For example, if your model has "Idle_Anim" instead of "idle":
        window.hootyController.updateAnimationMap(availableClips);
      }
    } else {
      console.error('❌ Animation mixer not found on the model');
    }
  });
  
  hootModel.addEventListener('model-error', (error) => {
    console.error('❌ Error loading Hooty model:', error.detail);
  });
}

// Enhance the HootyController to update animation names
class HootyController {
  constructor(modelEntity) {
    this.modelEntity = modelEntity;
    this.currentAnimation = 'idle';
    this.animationQueue = [];
    this.isAnimating = false;
    
    // Define animation clips and their durations (in ms)
    this.animations = {
      'idle': { duration: 0, loop: true },      // Default state, continuous loop
      'dance': { duration: 5000, loop: false }, // Dance for 5 seconds
      'wave': { duration: 2000, loop: false },  // Wave for 2 seconds
      'jump': { duration: 1500, loop: false },  // Jump for 1.5 seconds
      'love': { duration: 3000, loop: false }, // Cheer for 3 seconds
      'run': { duration: 2500, loop: false }  // Pitching motion for 2.5 seconds
    };
    
    // Keywords that trigger animations
    this.animationTriggers = {
      'dance': ['dance', 'dancing', 'move'],
      'wave': ['wave', 'hello', 'hi', 'hey'],
      'jump': ['jump', 'hop', 'excited'],
      'love': ['love', 'heart', 'fearless', 'happy', 'yay'],
      'run': ['run', 'jog', 'homerun', 'grandslam']
    };
    
    // Map of our animation names to actual clip names in the model
    this.clipNameMap = {
      'idle': 'Animation_Idle_02_withSkin.glb', // Will be updated when we know the actual names
      'dance': 'Animation_Gangnam_Groove_withSkin.glb',
      'wave': 'Animation_Big_Wave_Hello_withSkin.glb',
      'jump': 'jump',
      'love': 'Animation_Big_Heart_Gesture_withSkin.glb',
      'run': 'Animation_Running_withSkin.glb'
    };
  }
  
  // Update animation mapping based on available clips
  updateAnimationMap(availableClips) {
    console.log('models:', availableClips);
    
    // Try to match our animation names with available clips
    for (const [ourName, data] of Object.entries(this.animations)) {
      // Look for matches - case insensitive
      const matchingClip = availableClips.find(clipName => 
        clipName.toLowerCase().includes(ourName.toLowerCase()));
      
      if (matchingClip) {
        console.log(`Mapped "${ourName}" to actual clip "${matchingClip}"`);
        this.clipNameMap[ourName] = matchingClip;
      } else {
        console.warn(`No matching clip found for "${ourName}"`);
      }
    }
  }
  
  // Check message for animation triggers
  checkForAnimationTriggers(message) {
    const lowercaseMsg = message.toLowerCase();
    
    for (const [animation, triggers] of Object.entries(this.animationTriggers)) {
      if (triggers.some(trigger => lowercaseMsg.includes(trigger))) {
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
    
    // Get the actual clip name from our mapping
    const actualClipName = this.clipNameMap[animationName] || animationName;
    console.log(`Playing animation: ${animationName} (clip: ${actualClipName})`);
    
    // Add to queue if already animating
    if (this.isAnimating && !this.animations[animationName].loop) {
      this.animationQueue.push(animationName);
      return;
    }
    
    // Play the animation
    this.currentAnimation = animationName;
    this.modelEntity.setAttribute('animation-mixer', {
      clip: actualClipName,
      loop: this.animations[animationName].loop ? 'repeat' : 'once'
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
          const idleClipName = this.clipNameMap['idle'];
          this.modelEntity.setAttribute('animation-mixer', {
            clip: idleClipName,
            loop: 'repeat'
          });
        }
      }, this.animations[animationName].duration);
    }
  }
  
  // React to user message
  reactToMessage(message) {
    return this.checkForAnimationTriggers(message);
  }
  
  // React to bot response
  reactToBotResponse(response) {
    // Bot responses can also trigger animations
    return this.checkForAnimationTriggers(response);
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Make sure the model element exists before trying to use it
  const hootModel = document.querySelector('#hooty');
  if (!hootModel) {
    console.error('❌ Could not find #hooty element');
    return;
  }
  
  // Create and store the controller globally so it can be accessed
  window.hootyController = new HootyController(hootModel);
  
  // List available animations when the model loads
  listAvailableAnimations();
  
  // Connect to Botpress messages
  if (window.botpress) {
    window.botpress.on("webchat:message:sent", (event) => {
      const userMessage = event.message?.text || "";
      window.hootyController.reactToMessage(userMessage);
    });
    
    window.botpress.on("webchat:message:received", (event) => {
      const botResponse = event.message?.text || "";
      window.hootyController.reactToBotResponse(botResponse);
    });
  } else {
    console.warn("Botpress not available yet. Will try to connect later.");
    // Try again after Botpress is initialized
    setTimeout(() => {
      if (window.botpress) {
        window.botpress.on("webchat:message:sent", (event) => {
          const userMessage = event.message?.text || "";
          window.hootyController.reactToMessage(userMessage);
        });
        
        window.botpress.on("webchat:message:received", (event) => {
          const botResponse = event.message?.text || "";
          window.hootyController.reactToBotResponse(botResponse);
        });
      }
    }, 5000);
  }
  
  // Add debug button to test animations
  const animDebugDiv = document.createElement('div');
  animDebugDiv.style.position = 'fixed';
  animDebugDiv.style.bottom = '80px';
  animDebugDiv.style.left = '10px';
  animDebugDiv.style.zIndex = '9999';
  animDebugDiv.style.background = 'rgba(0,0,0,0.7)';
  animDebugDiv.style.padding = '10px';
  animDebugDiv.style.borderRadius = '5px';
  document.body.appendChild(animDebugDiv);
  
  // Add test buttons for each animation
  const animations = ['idle', 'dance', 'wave', 'jump', 'cheer', 'pitch'];
  animations.forEach(anim => {
    const btn = document.createElement('button');
    btn.textContent = `Test ${anim}`;
    btn.style.margin = '5px';
    btn.style.padding = '5px 10px';
    btn.addEventListener('click', () => {
      if (window.hootyController) {
        window.hootyController.playAnimation(anim);
      }
    });
    animDebugDiv.appendChild(btn);
  });
});

// Fix potential duplicate model issue
// Remove duplicate model reference if it exists
document.addEventListener('DOMContentLoaded', function() {
  const assetItems = document.querySelectorAll('a-asset-item#hooty-model');
  if (assetItems.length > 1) {
    console.warn('Found duplicate model references. Removing extras.');
    for (let i = 1; i < assetItems.length; i++) {
      assetItems[i].remove();
    }
  }
});

// Add a console output to confirm script is loaded
console.log('Hooty animation enhancement script loaded!');
