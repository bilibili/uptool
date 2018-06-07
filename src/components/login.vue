<template>
  <div>
  <font-awesome-icon v-show="isLoading" icon="spinner" class="center"/>
  <iframe
    src='https://passport.bilibili.com/ajax/miniLogin/minilogin'
    disablewebsecurity
    v-show="!isLoading"
  >
  </iframe>
  </div>
</template>

<script>
const { ipcRenderer, remote } = require("electron");
let win = remote.getCurrentWindow();
export default {
  name: "login",
  data() {
    return {
      isLoading: true
    }
  },
  mounted: function() {
    function resize() {
      // need to add the margins, a little bit smaller to make it looks elegant
      var height =
        $("iframe")
          .contents()
          .find("#content")
          // padding
          .height() + 25;

      var width = 
        $("iframe")
          .contents()
          .find("#content")
          // padding
          .width() + 90;
      console.log(width, height);
      win.setContentSize(width, height, true);
    }
    $("iframe").load(() => {
      this.isLoading = false
      // hack the css
      $("iframe").css;
      $("iframe")
        .contents()
        .find("#close")
        .css({
          visibility: "hidden"
        });
      $("iframe")
        .contents()
        .find("#wrapper")
        .css({
          height: "0"
        });
      $("iframe")
        .contents()
        .find("#content")
        .css({
          "-webkit-app-region": "drag",
          "border-radius": "0px",
          margin: "0 0 0 0"
        });
      $("iframe")
        .contents()
        .find("#geestcp")
        .css({
          "-webkit-app-region": "no-drag"
        });
      $("iframe")
        .contents()
        .find("#qrcode")
        .click(() => {
          resize();
        });
      $("iframe")
        .contents()
        .find("#tab-nav")
        .click(() => {
          resize();
        });
    });

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
  z-index: 99999;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
