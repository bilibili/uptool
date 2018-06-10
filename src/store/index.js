import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    preCroppedCovers: []
}

const getters = {
}

const mutations = {
    addCover(state, cover) {
        state.preCroppedCovers.push(cover)
    }
}
export default new Vuex.Store({
    state,
    getters,
    mutations
})