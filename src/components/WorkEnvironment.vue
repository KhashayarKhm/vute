<template>
	<v-container
		class="h-100 pa-0"
		fluid
	>
		<transition
			enter-active-class="animate__animated animate__fadeIn animate__fast"
			leave-active-class="animate__animated animate__fadeOut animate__fast"
			mode="out-in"
		>
			<component
				:is="currentComponent.name"
				v-bind="currentComponent.props"
				v-on="currentComponent.events"
			/>
		</transition>
	</v-container>
</template>

<script>
import WorkEnvironmentNoteViewer from './WorkEnvironmentNoteViewer.vue';
import WorkEnvironmentNoteEditor from './WorkEnvironmentNoteEditor.vue';
import WorkEnvironmentHomeView from './WorkEnvironmentHomeView.vue';

export default {
	components: {
		WorkEnvironmentNoteViewer,
		WorkEnvironmentNoteEditor,
		WorkEnvironmentHomeView,
	},
	model: {
		prop: 'currentView',
		event: 'change',
	},
	props: {
		editMode: Boolean,
		tags: {
			type: Array,
			validator: (tagsList) => tagsList.every((value) => typeof value === 'string'),
			default: () => [],
		},
		currentView: {
			validator: (noteObject) => noteObject === 'home'
				|| (typeof noteObject.subject === 'string' && typeof noteObject.tag === 'string' && typeof noteObject.content === 'object'),
			default: 'home',
			required: true,
		},
		defaultEditTag: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			previousTab: 'home',
		};
	},
	computed: {
		currentComponent() {
			switch (true) {
				case this.editMode:
					/* For "work-environment-note-editor" component */
					return {
						name: 'work-environment-note-editor',
						props: {
							tags: this.tags,
							note: this.currentView,
							defaultTag: this.defaultEditTag,
						},
						events: {
							exit: this.exitFromEditor,
						},
					};
				case this.currentView !== 'home':
					/* For "work-environment-note-viewer" component */
					return {
						name: 'work-environment-note-viewer',
						props: {
							note: this.currentView,
							key: this.currentView._id,
						},
						events: {
							edit: this.editNote,
							remove: this.changeView,
						},
					};
				default:
					return {
						name: 'work-environment-home-view',
						props: {
							history: this.history(),
						},
						events: {
							change: this.changeView,
						},
					};
			}
		},
	},
	watch: {
		defaultEditTag(value) {
			if (typeof value === 'string') {
				if (!this.tags.includes(value)) {
					this.$emit('update:defaultEditTag', '');
				}
				this.$emit('update:editMode', true);
			}
		},
		currentView(currentTab, previousTab) {
			this.history(currentTab);
			this.previousTab = previousTab;
		},
	},
	methods: {
		editNote() {
			this.$emit('update:editMode', true);
		},
		/* eslint consistent-return: 0 */
		history(note, add = true) {
			const historyList = JSON.parse(localStorage.getItem('history'));
			if (this.validateHistoryValue(note)) {
				if (add) {
					if (!historyList || !(Array.isArray(historyList))) {
						localStorage.setItem('history', JSON.stringify([note]));
					} else if (historyList.every((item) => item._id !== note._id)) {
						localStorage.setItem('history', JSON.stringify(historyList.concat(note)));
					} else {
						const modifiedHistory = historyList
							.sort((sortNote) => (sortNote._id === note._id ? 1 : -1));
						modifiedHistory.splice(modifiedHistory.length - 1, 1, note);
						localStorage.setItem('history', JSON.stringify(modifiedHistory));
					}
				} else {
					localStorage.setItem(
						'history',
						JSON.stringify(historyList.filter((item) => item._id !== note._id)),
					);
				}
			} else {
				if (historyList instanceof Array) {
					const validList = historyList.filter((item) => this.validateHistoryValue(item));
					const numberExtraNotes = validList.length - 8;
					localStorage.setItem('history',
						JSON.stringify(numberExtraNotes > 0 ? validList.slice(numberExtraNotes) : validList));
					return numberExtraNotes > 0
						? validList.slice(numberExtraNotes).reverse()
						: validList.reverse();
				}
				localStorage.setItem('history', JSON.stringify([]));
				return [];
			}
		},
		changeView(note, remove = false) {
			if (remove) {
				this.$emit('remove-note', this.currentView);
			}
			this.history(note, !remove);
			this.$emit('change', remove ? this.previousTab : note);
		},
		validateHistoryValue(noteObject) {
			if (!noteObject) return false;
			return (
				typeof noteObject.subject === 'string'
				&& typeof noteObject.tag === 'string'
				&& typeof noteObject.content === 'object'
			);
		},
		exitFromEditor(modifiedNote) {
			if (modifiedNote && !modifiedNote.new) {
				this.history(modifiedNote.object);
			}
			this.$emit('update:defaultEditTag', null);
			this.$emit('update:editMode', false);
			this.$emit('modify', modifiedNote);
		},
	},
};
</script>
