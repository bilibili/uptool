<template>
  <div id="app" class="has-navbar-fixed-top">
    <titlebar v-if="!isLoginScreen" />
    <div class="columns is-gapless is-fullheight">
      <div id="sidebar" class="column is-one-fifth" v-if="!isLoginScreen">
        <p>
          <sidebar />
        </p>
      </div>
      <div class="column is-main-content">
        <keep-alive include="submit_page">
          <router-view />
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import sidebar from "./components/sidebar.vue";
import titlebar from "./components/titlebar.vue"

global.jQuery = require("jquery");
var $ = global.jQuery;
window.$ = $;

export default {
  name: "app",
  components: {
    sidebar,
    titlebar
  },
  computed: {
    isLoginScreen() {
      return this.$route.path == '/login'
    }
  }
};
</script>

<style scoped>
.columns {
  overflow: hidden;
  /* height: 100vh; */
  height: calc(100vh - 3.25rem)
}
.is-main-content {
  overflow: auto;
}
</style>
<style>
::-webkit-scrollbar {
  display: none;
}
.box {
  margin: 1px;
}
</style>

<style>
#sidebar {
  background: #fcfcfc;
  border: 1px solid rgb(229,233,239);
}

.has-navbar-fixed-top {
  padding-top: 3.25rem;
}
</style>

