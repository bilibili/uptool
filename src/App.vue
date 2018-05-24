<template>
  <div id="app">
    <p v-if="this.$route.path !== '/login'">
      <router-link to="/submit">Submit</router-link>
      <router-link to="/placeholder">PlaceHolder</router-link>
    </p>
    <keep-alive include="submit_page">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
global.jQuery = require('jquery');
var $ = global.jQuery;
window.$ = $;

export default {
  name: "app"
};
</script>