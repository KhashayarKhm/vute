import '@mocks/match-media.mock';
import { createLocalVue, mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import NavigationDrawer from '@/components/NavigationDrawer.vue';

Vue.use(Vuetify);

const localVue = createLocalVue();

describe('NavigationDrawer.vue', () => {
	let vuetify;
	beforeEach(() => {
		vuetify = new Vuetify();
	});

	it('should render without any errors', () => {
		const propsData = {
			value: false,
			tagObject: {
				foo: [
					{
						_id: 23,
						subject: 'lorem',
						tag: 'foo',
						content: '',
					},
				],
			},
		};

		const wrapper = mount(NavigationDrawer, {
			propsData,
			localVue,
			vuetify,
		});

		expect(wrapper).toBeDefined();
	});
});
