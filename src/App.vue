<template>
  <div id="app">
    <p>
      <router-link to="/submit">Submit</router-link>
      <router-link to="/crop">Crop</router-link>
    </p>
    <keep-alive>
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