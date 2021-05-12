import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin, } from 'bootstrap-vue'

// Import bootstrap and bootstrap-vue
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Import animate.css
import 'animate.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
