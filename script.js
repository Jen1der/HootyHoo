const params = new URL(window.location.href).searchParams;
const configParams = params.get("config");
let config = {};

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

