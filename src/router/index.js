import Vue from 'vue'
import Router from 'vue-router'
import submit_page from '@/components/submit_page'
import second_page_placeholder from '@/components/second_page_placeholder'
import login from '@/components/login'
import transcode from '@/components/transcode'

Vue.use(Router)

const routes = [
  { path: "/submit", component: submit_page },
  { path: "/placeholder", component: second_page_placeholder },
  { path: "/login", component: login },
  { path: "/transcode", component: transcode }
];


export default new Router({
  routes
})
