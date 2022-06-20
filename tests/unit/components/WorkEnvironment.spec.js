import '@mocks/match-media.mock';
import { createLocalVue, mount } from '@vue/test-utils';
import WorkEnvironment from '@/components/WorkEnvironment.vue';
import Vuetify from 'vuetify';
import Vue from 'vue';

Vue.use(Vuetify);

const localVue = createLocalVue();

describe('WorkEnvironment.vue', () => {
	let vuetify;
	beforeEach(() => {
		vuetify = new Vuetify();
	});

	it('should mount without errors', () => {
		const propsData = {
			tags: ['foo', 'bar'],
			editMode: false,
			currentView: 'home',
			defaultEditTag: 'label',
		};

		const wrapper = mount(WorkEnvironment, {
			propsData,
			localVue,
			vuetify,
		});

		expect(wrapper).toBeDefined();
	});
});
