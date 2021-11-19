<template>
	<v-app
		v-resize="onResize"
		style="background-color: #263238;"
	>
		<navigation-drawer
			v-model="drawerValue"
			:tag-object="organizedNotes"
			@change="currentTab = $event"
			@create="defaultEditTag = $event"
		/>
		<app-bar
			v-model="currentTab"
			:editor-object="editor"
			:view-edit-tools.sync="editMode"
			:remove-tab.sync="removeTab"
			:all-notes="organizedNotes"
		/>
		<v-main class="h-100 overflow-auto">
			<v-progress-linear
				color="teal accent-3"
				:value="progress.value"
				:active="progress.active"
				absolute
			/>
			<work-environment
				v-model="currentTab"
				:edit-mode.sync="editMode"
				:default-edit-tag.sync="defaultEditTag"
				:tags="tags"
				@modify="modifyNote"
				@remove-note="removeNote"
			/>
			<v-btn
				v-if="!desktopBreakpoint"
				class="rounded-r-circle green accent-3 my-4 ml-n2"
				style="bottom: 0; position: fixed;"
				color="black"
				elevation="2"
				icon
				small
				tile
				@click="drawerValue = true"
			>
				<v-icon style="position: relative; right: -2px;">
					mdi-chevron-right
				</v-icon>
			</v-btn>
		</v-main>
	</v-app>
</template>

<script>
import { Editor } from 'tiptap';
import {
	Blockquote,
	Bold,
	BulletList,
	Code,
	CodeBlock,
	HardBreak,
	Heading,
	History,
	HorizontalRule,
	Italic,
	Link,
	ListItem,
	OrderedList,
	Strike,
	Underline,
} from 'tiptap-extensions';
import ZangoDB from 'zangodb';
import AppBar from './components/AppBar.vue';
import WorkEnvironment from './components/WorkEnvironment.vue';
import NavigationDrawer from './components/NavigationDrawer.vue';

export default {
	name: 'App',
	components: {
		AppBar,
		NavigationDrawer,
		WorkEnvironment,
	},
	data() {
		return {
			tags: [],
			organizedNotes: {},
			database: new ZangoDB.Db('v_note', { notes: ['subject', 'tag', 'content'] }),
			drawerValue: false,
			currentTabValue: 'home',
			editMode: false,
			desktopBreakpoint: null,
			progress: {
				active: false,
				value: 0,
			},
			removeTab: null,
			defaultEditTag: null,
			editor: new Editor({
				extensions: [
					new Blockquote(),
					new Bold(),
					new BulletList(),
					new Code(),
					new CodeBlock(),
					new HardBreak(),
					new Heading({ levels: [1, 2, 3] }),
					new History(),
					new HorizontalRule(),
					new Italic(),
					new Link(),
					new ListItem(),
					new OrderedList(),
					new Strike(),
					new Underline(),
				],
			}),
		};
	},
	computed: {
		currentTab: {
			set(value) {
				if (value === 'home') {
					this.currentTabValue = value;
				} else if (value instanceof Object) {
					this.currentTabValue = Object.values(this.organizedNotes)
						.flat().find((note) => note._id === value._id);
				}
			},
			get() {
				return this.currentTabValue;
			},
		},
	},
	mounted() {
		this.getNotes();
	},
	methods: {
		onResize() {
			this.desktopBreakpoint = matchMedia('(min-width: 768px)').matches;
		},
		async getNotes() {
			this.progress.active = true;
			const notesOS = this.database.collection('notes');
			const allNotes = await notesOS.find().toArray();
			const progressStep = 80 / allNotes.length;
			this.progress.value = 10;
			this.tags = [];
			this.$set(
				this,
				'organizedNotes',
				allNotes.reduce((finalObject, noteObject) => {
					if (!this.tags.includes(noteObject.tag)) {
						this.tags = this.tags.concat(noteObject.tag);
						Object.defineProperty(finalObject, noteObject.tag, {
							enumerable: true,
							writable: true,
							value: [],
						});
					}
					if (finalObject[noteObject.tag]
						.findIndex((note) => note._id === noteObject._id) === -1) {
						finalObject[noteObject.tag].push(noteObject);
					}
					this.progress.value += progressStep;
					return finalObject;
				}, {}),
			);
			this.tags = this.tags.sort((tag) => tag === 'Other');
			this.progress.value = 100;
			this.progress.active = false;
			this.progress.value = 0;
		},
		async modifyNote(mutateNote) {
			if (!mutateNote) return;
			const notesOS = this.database.collection('notes');
			if (mutateNote.new) {
				await notesOS.insert(mutateNote.object);
			} else {
				await notesOS.update({ _id: { $eq: mutateNote.object._id } }, mutateNote.object);
				this.currentTab = mutateNote.object;
			}
			this.getNotes();
		},
		removeNote(targetNote) {
			const notesOS = this.database.collection('notes');
			notesOS.remove({ _id: targetNote._id });
			this.removeTab = targetNote._id;
			this.organizedNotes[targetNote.tag] = this.organizedNotes[targetNote.tag].filter(
				(note) => note._id !== targetNote._id,
			);
			this.tags = this.tags.filter((tag) => tag !== targetNote.tag);
			if (!this.organizedNotes[targetNote.tag].length) {
				this.organizedNotes = Object.keys(this.organizedNotes).reduce((object, tagName) => {
					if (this.organizedNotes[tagName].length) {
						const targetTagObject = object;
						targetTagObject[tagName] = this.organizedNotes[tagName];
					}
					return object;
				}, {});
			}
		},
	},
};
</script>

<style>
@font-face {
	font-family: 'Markazi';
	src: url('./assets/Markazi.ttf');
}

html {
	font-size: 18px;
	line-height: 18px;
	width: 100vw;
	height: 100vh;
	overflow: auto !important;
}

body {
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#app {
	font-family: 'Markazi';
	font-size: 1em;
	line-height: 1em;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	background-color: #16c79a;
	color: #f8f1f1;
	width: 100%;
	height: 100%;
}

#app .min-height-min-content {
	min-height: min-content !important;
}

#app .position-absolute {
	position: absolute !important;
}

#app .h-100 {
	height: 100% !important;
}

#app .mirror-y {
	transform: rotateY(180deg);
}
</style>
