<template>
  <iframe src='https://passport.bilibili.com/ajax/miniLogin/minilogin' disablewebsecurity>
  </iframe>
</template>

<script>
const { ipcRenderer } = require("electron");
export default {
  name: "login",
  mounted: function() {
    const webview = document.querySelector("webview");
    window.onmessage = function(e) {
      e = e || window.event;
      switch (e.data) {
        case "success":
          ipcRenderer.send("loggedIn");
          window.close();
        case "close":
          window.close();
      }
    };
  }
};
</script>

<style scoped>
iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  zindex: 99999;
}
</style>
