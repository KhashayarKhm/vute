import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';

// Import bootstrap and bootstrap-vue with my customization
import './custom-bv.scss';

// Import animate.css
import 'animate.css';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

new Vue({
	render: (h) => h(App),
}).$mount('#app');
