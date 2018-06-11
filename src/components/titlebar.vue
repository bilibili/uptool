<template>
  <nav class="navbar is-fixed-top level is-paddingless is-marginless">
    <!-- Left side -->
    <div class="level-left">
      <!-- place holder, make some space on the left end -->
      <p class="level-item"></p>
      <traffic-light v-if="isMacControls" class="level-item nodrag" />
      <!-- logo goes here, vector ypa -->
      <img :src="logoSrc" class="logo level-item" />
      <p class="level-item">
        恭喜快手喜提 AcFUN
      </p>
    </div>

    <!-- Right side -->
    <div class="level-right">
      <div class="level-item">
        <!-- avatar -->
        <figure class="image is-24x24">
          <img :src="myInfo.face" class="avatar">
        </figure>
      </div>
      <div @mouseout="isDropdownShown=false" @mouseover="isDropdownShown=true">
        <!-- arrow down -->
        <div class="level-item dropdown" :class="{'is-active': isDropdownShown}">
          <div class="dropdown-trigger">
            <font-awesome-icon class="nodrag" icon="angle-down" />
          </div>
          <!-- dropdown -->
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a href="#" class="nodrag dropdown-item" @click="logOut">
                登出
              </a>
            </div>
          </div>
        </div>
      </div>
      <p class="level-item">
      </p>
      <p class="level-item">
        <font-awesome-icon icon="cog" class="nodrag" @click="pref" />
      </p>
      <win-controls v-if="!isMacControls" class="level-item" />
      <p class="level-item"> </p>
    </div>
  </nav>
</template>

<script>
var path = require("path");
var os = require("os");
import { format as formatUrl } from "url";
import traffic_light from "./traffic_light.vue";
import win_controls from "./win_controls";
const { ipcRenderer, remote } = require("electron");
export default {
  name: "titlebar",
  computed: {
    logoSrc() {
      return formatUrl({
        pathname: path.join(__static, "logo.svg"),
        protocol: "file",
        slashes: true
      });
    },
    isMacControls() {
      var preferences = ipcRenderer.sendSync("getPreferences");
      var appearancePref = preferences.appearance;
      if (appearancePref == undefined) {
        return os.platform == "darwin" ? true : false;
      } else {
        if (appearancePref && appearancePref.controlStyle == "mac") {
          return true;
        } else {
          return false;
        }
      }
    }
  },
  data() {
    return {
      preData: {},
      myInfo: {},
      isDropdownShown: false
    };
  },
  created: function() {
    $.getJSON(
      "https://member.bilibili.com/x/web/archive/pre?langs=cn",
      json => {
        if (json.code == 0) {
          this.preData = json;
          this.myInfo = this.preData.data.myinfo;
        }
      }
    );
  },
  methods: {
    logOut: function() {
      ipcRenderer.send("logOut");
    },
    pref: function() {
      ipcRenderer.send("showPref");
    }
  },
  components: {
    "traffic-light": traffic_light,
    "win-controls": win_controls
  }
};
</script>

<style scoped>
.logo {
  height: 50px;
}

.avatar {
  border-radius: 12px;
}

nav {
  background: #ff709e;
  color: white;
  -webkit-app-region: drag;
}
</style>

<style>
.nodrag {
  -webkit-app-region: no-drag;
}
</style>
