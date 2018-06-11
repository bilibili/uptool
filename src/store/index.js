import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    preCroppedCovers: [],
    cover: null,
    cropperData: null,
    croppedCover: null
}

const getters = {
}

const mutations = {
    addCover(state, cover) {
        // add a precropped cover to the pandng list
        state.preCroppedCovers.push(cover)
    },
    setCover(state, cover) {
        // user has set the cover
        state.cover = cover
    },
    setCropperData(state, cropperData) {
        state.cropperData = cropperData
    },
    setCroppedCover(state, cover) {
        state.croppedCover = cover
    }
}
export default new Vuex.Store({
    state,
    getters,
    mutations
})