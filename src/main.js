import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';

// Import animate.css
import 'animate.css';

import vuetify from './plugins/vuetify';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

new Vue({
	vuetify,
	render: (h) => h(App),
}).$mount('#app');
