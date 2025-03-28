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
  window.botpress.sendMessage(input.value);
}

function send_event() {
  window.botpress.sendEvent({
    // You can pass any data to your bot here...
    // Your bot will receive an event of type "webchat:trigger"
    // You can add a Trigger Node to your Main Workflow to handle it
    // Or you can also process the event from a Hook
  });
}

function change_theme() {
  const colors = [
    "#d6409f",
    "#3a8ed6",
    "#f94d4d",
    "#42d697",
    "#f2c14e",
    "#9354e2",
    "#e64f5e",
    "#5ea4a4",
    "#c35020",
    "#7a3e9d"
  ];
  const variants = ["soft", "solid"]; //
  const themes = ["light", "dark"];

  try {
    botpress.fabIframe.remove();
  } catch {}
  try {
    botpress.webchatIframe.remove();
  } catch {}

  botpress.initialized = false;
  botpress.init({
    ...botpress,
    configuration: {
      ...botpress.configuration,
      color: pickRandom(colors),
      variant: pickRandom(variants),
      themeMode: pickRandom(themes)
    },
    selector: "#webchat"
  });
}

window.botpress.on("*", (event) => {
  const eventsEl = document.getElementById("events");
  eventsEl.value += "\n" + JSON.stringify(event) + "\n";
  eventsEl.scrollTop = eventsEl.scrollHeight;
});

function pickRandom(arr) {
  return arr.at(Math.floor(Math.random() * arr.length));
}

function showError(error) {
  const el = document.getElementById("error");
  el.style.display = "block";
  el.innerText = error;
}

let check = setInterval(function () {
  if (window.botpress.initialized) {
    const el = document.getElementById("success");
    el.style.display = "block";
    el.innerText = "Initialized: " + window.botpress.botId;
    clearInterval(check);
  }
}, 500);

function tryDecode(str) {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch {}

  try {
    return JSON.parse(atob(str));
  } catch {}

  return {};
}
