
<!-- In your <head> tag -->
<script src="https://cdn.botpress.cloud/webchat/v2.3/inject.js"></script>
<style>
  #webchat .bpWebchat {
    position: unset;
    width: 100%;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
  }

  #webchat .bpFab {
    display: none;
  }
</style>

<!-- Put this on your page BEFORE the script below -->
<div id="webchat" style="width: 500px; height: 500px;"></div>

<!-- In your <body> tag -->
<script>
  window.botpress.on("webchat:ready", () => {
    window.botpress.open();
  });
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
</script>
