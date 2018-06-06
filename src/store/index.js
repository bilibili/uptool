import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    tabs: [],
    counter: 0
}

const getters = {
    getActiveTabs: state => {
        return state.tabs.filter(tab => tab.isActive)
    }
}

const mutations = {
    addTab(state, payload) {
        const router = payload.router
        const template = payload.template
        const ifRedirect = payload.ifRedirect
        state.counter++
        const nextKey = state.counter
        const tabObj = {
            key: nextKey,
            path: '/submit/' + nextKey.toString(),
            isActive: true
        }
        state.tabs.push(tabObj)
        router.addRoutes([{
            path: tabObj.path,
            component: template
        }])
        if (ifRedirect) {
            router.push(tabObj.path)
        }
    }
}
export default new Vuex.Store({
    state,
    getters,
    mutations
})