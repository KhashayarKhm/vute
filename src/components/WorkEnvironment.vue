<template lang="html">
	<div class="work-env">
		<b-modal
			id="make-sure-alert"
			v-model="makeSureAlertVisibility"
			body-bg-variant="primary"
			body-text-variant="light"
			centered
			hide-header
			hide-footer
		>
			<p>Are you sure to remove this note?</p>
			<div class="d-flex align-content-center justify-content-center">
				<b-button
					size="sm"
					variant="danger"
					class="mx-1 w-25"
					@click="removeNote"
				>
					Remove
				</b-button>
				<b-button
					size="sm"
					variant="outline-light"
					class="mx-1 w-25"
					@click="makeSureAlertVisibility = false"
				>
					Cancel
				</b-button>
			</div>
		</b-modal>
		<transition
			enter-active-class="animate__animated animate__zoomIn"
			leave-active-class="animate__animated animate__zoomOut"
		>
			<div
				v-show="!addNew && !editMode"
				class="sub-env"
			>
				<transition enter-active-class="animate__animated animate__backInDown">
					<note
						v-show="(note !== 'home') && !switchNote"
						:display="!editMode"
						:note="currentNote"
						@edit="editNote"
						@remove="makeSureAlertVisibility = true"
					/>
				</transition>
				<transition leave-active-class="animate__animated animate__backOutDown">
					<note
						v-show="(note !== 'home') && switchNote"
						:display="!editMode"
						:note="previousNote"
					/>
				</transition>
				<transition
					appear-active-class="animate__animated animate__backInDown"
					leave-active-class="animate__animated animate__backOutDown"
					appear
				>
					<div
						v-if="note === 'home'"
						class="no-choose"
					>
						<h1 style="display: flex; align-items: center">
							No note choose to display
							<b-icon-exclamation-triangle />
						</h1>
					</div>
				</transition>
			</div>
		</transition>
		<transition
			enter-active-class="animate__animated animate__fadeInLeft"
			leave-active-class="animate__animated animate__fadeOutLeft"
		>
			<div
				v-show="addNew || editMode"
				class="sub-env"
			>
				<edit-note-env
					:tags="tags"
					:note="targetEditingNote"
					@exit="exitFromEditor($event)"
				/>
			</div>
		</transition>
	</div>
</template>

<script>
import Note from './Note.vue';
import EditNoteEnv from './EditNoteEnv.vue';

export default {
	components: {
		Note,
		EditNoteEnv,
	},
	props: {
		tags: {
			type: Array,
			validator: (tagsList) => tagsList.every((value) => typeof value === 'string'),
		},
		note: {
			validator: (noteObject) => noteObject === 'home' || (typeof noteObject.subject === 'string' && typeof noteObject.tag === 'string' && typeof noteObject.content === 'string'),
			default: 'home',
		},
		addNew: Boolean,
	},
	data() {
		return {
			switchNote: false,
			editMode: false,
			previousNote: { subject: '', tag: '', content: '' },
			targetEditingNote: { subject: '', tag: '', content: '' },
			makeSureAlertVisibility: false,
		};
	},
	computed: {
		currentNote() {
			return this.note === 'home' ? { subject: '', tag: '', content: '' } : this.note;
		},
		noteSubject() {
			return this.note === 'home' ? '' : this.note.subject;
		},
	},
	watch: {
		note(currentObject, previousObject) {
			if (previousObject) {
				this.previousNote = previousObject;
				this.switchNote = true;
				setTimeout(function () { this.switchNote = false; });
			} else {
				this.switchNote = false;
			}
		},
	},
	methods: {
		editNote() {
			this.targetEditingNote = this.currentNote;
			this.editMode = true;
		},
		exitFromEditor(modifiedNote) {
			this.targetEditingNote = { subject: '', tag: '', content: '' };
			this.editMode = false;
			this.$emit('modify', modifiedNote ? { previousNote: this.currentNote, modifiedNote } : null);
		},
		removeNote() {
			this.makeSureAlertVisibility = false;
			this.$emit('remove-note', this.currentNote, this.previousNote);
		},
	},
};
</script>

<style lang="css" scoped>
.work-env {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.sub-env {
	position: absolute;
	width: 85%;
	height: 70%;
}

.no-choose {
	display: flex;
	align-items: center;
	justify-content: space-around;
	flex-direction: column;
}
</style>
