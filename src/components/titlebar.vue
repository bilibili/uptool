<template>
    <nav class="navbar is-fixed-top level is-paddingless is-marginless" style=" background:#FF709E; height:40px; color:white;-webkit-app-region:drag;" @mouseout="isDropdownShown=false">
        <!-- Left side -->
        <div class="level-left">
            <p class="level-item">
            </p>
            <div class="level-item">
            <figure class="image is-24x24">
                <img :src="myInfo.face" class="avatar">
            </figure>
            </div>

            <div @mouseout="isDropdownShown=false" @mouseover="isDropdownShown=true">
                <div class="level-item dropdown" :class="{'is-active': isDropdownShown}">
                    <div class="dropdown-trigger">
                        <font-awesome-icon icon="angle-down" />
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <a href="#" class="dropdown-item" @click="logOut">
                                登出
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <p class="level-item">
                {{myInfo.uname}}
            </p>
            <p class="level-item"> | </p>
            <div class="level-item ">
                Placeholder
            </div>

        </div>

        <!-- Right side -->
        <div class="level-right">
            <p class="level-item">
                <font-awesome-icon icon="cog" />
            </p>
            <p class="level-item"> | </p>
            <p class="level-item">
                <font-awesome-icon icon="minus" />
            </p>
            <p class="level-item">
                <font-awesome-icon icon="times" />
            </p>
            <p class="level-item"> </p>
        </div>
    </nav>
</template>

<script>
const { ipcRenderer, remote } = require("electron");
export default {
  name: "titlebar",
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
          ipcRenderer.send("logOut")
      }
  }
};
</script>

<style scoped>
.avatar {
  border-radius: 12px;
}
</style>
