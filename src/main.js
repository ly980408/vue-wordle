import Vue from 'vue'
import App from './App.vue'

import './style.css'

Vue.config.productionTip = false

// resize for scaling the board size
window.addEventListener('resize', onResize)
// set size on startup
onResize()

function onResize() {
  // get actual vh on mobile
  document.body.style.setProperty('--vh', window.innerHeight + 'px')
}

new Vue({
  render: h => h(App)
}).$mount('#app')
