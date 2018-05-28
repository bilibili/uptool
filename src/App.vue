<template>
  <div id="app">
    <div class="columns is-gapless is-fullheight">
      <div id="sidebar" class="column is-one-quarter">
        <p v-if="this.$route.path !== '/login'">
          <sidebar></sidebar>
        </p>
      </div>
      <div class="column is-main-content">
        <keep-alive include="submit_page">
          <router-view></router-view>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import sidebar from "./components/sidebar.vue";

global.jQuery = require("jquery");
var $ = global.jQuery;
window.$ = $;

export default {
  name: "app",
  components: {
    sidebar
  }
};
</script>

<style scoped>
.columns {
  overflow: hidden;
  height: 100vh;
}
.is-main-content {
  overflow: auto;
}
</style>
<style>
::-webkit-scrollbar {
  display: none;
}
</style>
