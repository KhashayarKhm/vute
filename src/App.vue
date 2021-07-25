<template>
	<div id="app">
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
				<b-button
					v-if="mobileScreenMatches"
					v-b-toggle.note-list
					variant="outline-primary"
					class="border-0"
				>
					<b-icon-file-text />
				</b-button>
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
						:note="targetDisplayNote"
						@modify="modifyNote"
						@remove-note="removeNote"
					/>
				</b-col>
				<b-col
					col
					lg="3"
					md="4"
					order-md="1"
					:style="{
						height: mobileScreenMatches ? 0 : null,
						position: mobileScreenMatches ? 'absolute' : null,
					}"
				>
					<sidebar
						:toggle="mobileScreenMatches"
						:tags="tags"
						:notes="organizedNotes"
						@add-note="workEnvMode.addNew = true"
						@switch-note="targetDisplayNote = $event"
					/>
				</b-col>
			</b-row>
		</b-container>
	</div>
</template>

<script>
import ZangoDB from 'zangodb';
import WorkEnvironment from './components/WorkEnvironment.vue';
import Sidebar from './components/Sidebar.vue';

export default {
	name: 'App',
	components: {
		WorkEnvironment,
		Sidebar,
	},
	data() {
		return {
			workEnvMode: { addNew: false },
			tags: [],
			organizedNotes: {},
			mobileScreenMatches: true,
			database: new ZangoDB.Db('v_note', { notes: ['subject', 'tag', 'content'] }),
			targetDisplayNote: null,
		};
	},
	mounted() {
		this.getNotes();
		this.mobileScreenMatches = window.matchMedia('(max-width: 768px)').matches;
		window.addEventListener('resize', () => {
			this.mobileScreenMatches = window.matchMedia('(max-width: 768px)').matches;
		});
	},
	methods: {
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

/* This styles are for "EditNoteEnv" component */
#app div.editor > form.add-form > div.editor__content > div.ProseMirror {
	padding: 0 0.5rem 0 0.3rem;
	border-left: 0.2em solid var(--red);
	overflow-y: scroll;
	height: 100%;
}

#app div.editor > form.add-form > div.editor__content > div.ProseMirror:focus-visible {
	outline: none;
	border-color: var(--green);
}

#app div.editor > form.add-form > div.editor__content > div.ProseMirror pre {
	background-color: var(--dark);
	color: var(--light);
	width: max-content;
	padding: 0.5rem;
	border-radius: 0.3rem;
	margin: 1rem 0;
	font-size: 0.8em;
}

#app div.editor > form.add-form > div.editor__content > div.ProseMirror blockquote {
	background-color: inherit;
	border-left: 0.2rem solid lightgrey;
	padding-left: 0.5rem;
}

#app
	div.editor
	> form.add-form
	> div.editor__content
	> div.ProseMirror
	> p.is-editor-empty:first-child::before {
	content: attr(data-empty-text);
	color: #aaa;
	pointer-events: none;
	height: 0;
	font-style: italic;
	font-size: 1.3rem;
}

.dynamic-sidebar-width {
	width: 100% !important;
}

@media screen and (min-width: 576px) {
	.dynamic-sidebar-width {
		width: 325px !important;
	}
}

@media screen and (min-width: 768px) {
	.dynamic-sidebar-width {
		width: 33.333% !important;
	}
}

@media screen and (min-width: 992px) {
	.dynamic-sidebar-width {
		width: 25% !important;
	}
}
</style>
