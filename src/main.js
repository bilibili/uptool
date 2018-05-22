import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'bulma/css/bulma.css'
import 'cropperjs/dist/cropper.css'
// require("./js/ybuploader")

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
