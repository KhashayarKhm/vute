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
		<v-main>
			<b-container
				class="h-100"
				fluid
			>
				<b-row
					:align-h="mobileScreenMatches ? 'around' : 'end'"
					align-v="center"
					cols="12"
					style="height: 3em"
				>
					<h1
						class="m-0 h3"
						:class="{ 'mx-5': !mobileScreenMatches }"
					>
						<strong>Vute</strong>
					</h1>
				</b-row>
				<b-row style="height: calc(100% - 3em); display: flex; justify-content: center">
					<b-col
						lg="9"
						md="8"
						cols="12"
						order-md="2"
						class="h-100"
					>
						<work-environment
							:tags="tags"
							:add-new="workEnvMode.addNew"
							:note="selectedTab"
							@modify="modifyNote"
							@remove-note="removeNote"
						/>
					</b-col>
				</b-row>
			</b-container>
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
import ZangoDB from 'zangodb';
import WorkEnvironment from './components/WorkEnvironment.vue';
import NavigationDrawer from './components/NavigationDrawer.vue';

export default {
	name: 'App',
	components: {
		NavigationDrawer,
		WorkEnvironment,
	},
	data() {
		return {
			workEnvMode: { addNew: false },
			tags: [],
			organizedNotes: {},
			mobileScreenMatches: true,
			database: new ZangoDB.Db('v_note', { notes: ['subject', 'tag', 'content'] }),
			targetDisplayNote: null,
			drawerValue: false,
			newTabValue: null,
			currentTabValue: 'home',
			editMode: false,
			desktopBreakpoint: null,
			defaultEditTag: null,
		};
	},
	computed: {
		currentTab: {
			set(value) {
				if (value === 'home') {
					this.currentTabValue = value;
				} else if (value instanceof Object) {
					const emptyObject = {};
					this.currentTabValue = Object.assign(emptyObject, value);
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
			const notesOS = this.database.collection('notes');
			const allNotes = await notesOS.find().toArray();
			allNotes.forEach((noteObject) => {
				if (!this.tags.includes(noteObject.tag)) {
					this.tags.push(noteObject.tag);
					this.organizedNotes[noteObject.tag] = [];
				}
				if (
					this.organizedNotes[noteObject.tag].findIndex(
						/* "ono" stands for "Organized Notes Object" */
						(ono) => ono.subject === noteObject.subject,
					) === -1
				) {
					this.organizedNotes[noteObject.tag].push(noteObject);
				}
			});
			const emptyObject = {};
			this.organizedNotes = Object.assign(emptyObject, this.organizedNotes);
		},
		async modifyNote(object) {
			if (!object) {
				this.workEnvMode.addNew = false;
				return;
			}
			const notesOS = this.database.collection('notes');
			if (this.workEnvMode.addNew) {
				notesOS.insert(object.modifiedNote);
				this.workEnvMode.addNew = false;
			} else {
				notesOS.update(object.previousNote, object.modifiedNote);
				this.organizedNotes[object.previousNote.tag] = this.organizedNotes[
					object.previousNote.tag
					/* "ono" stands for "Organized Notes Object" */
				].filter((ono) => ono.subject !== object.previousNote.subject);
				if (object.modifiedNote.subject) {
					this.targetDisplayNote.subject = object.modifiedNote.subject;
				}
				if (object.modifiedNote.tag) {
					this.targetDisplayNote.tag = object.modifiedNote.subject;
				}
				if (object.modifiedNote.content) {
					this.targetDisplayNote.content = object.modifiedNote.content;
				}
			}
			this.getNotes();
		},
		removeNote(targetNote, previousNote) {
			/* eslint no-underscore-dangle: 0 */
			const notesOS = this.database.collection('notes');
			notesOS.remove({ _id: targetNote._id });
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
			this.targetDisplayNote = previousNote._id ? previousNote : null;
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
