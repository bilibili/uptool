import Vue from 'vue'
import Router from 'vue-router'
import submit_page from '@/components/submit_page'
import second_page_placeholder from '@/components/second_page_placeholder'

Vue.use(Router)

const routes = [
    { path: "/submit", component: submit_page },
    { path: "/placeholder", component: second_page_placeholder }
  ];
  

export default new Router({
  routes
})
