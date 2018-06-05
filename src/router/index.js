import Vue from 'vue'
import Router from 'vue-router'
import submit_page from '@/components/submit_page'
import submit_prompt from '@/components/submit_prompt'
import second_page_placeholder from '@/components/second_page_placeholder'
import login from '@/components/login'

Vue.use(Router)

const routes = [
  { path: "/submit", component: submit_prompt },
  { path: "/placeholder", component: second_page_placeholder },
  { path: "/login", component: login }
];


export default new Router({
  routes
})
