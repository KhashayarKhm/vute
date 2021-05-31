<template>
	<b-container>
		<b-col cols="12">
			<b-row>
				<b-button
					v-b-toggle="name"
					:pressed.sync="isOpen"
					:class="dyWaitClass"
					class="v-button"
					variant="outline-success"
				>
					<span>{{ name }}</span>
					<b-icon-caret-down-fill
						class="icon"
						:class="{ r90: !isOpen }"
					/>
				</b-button>
			</b-row>
			<b-row align-h="center">
				<b-collapse
					:id="name"
					class="note-list-env"
					@show="wait"
					@hidden="wait"
				>
					<b-container class="note-list-env">
						<b-col cols="12">
							<b-row
								v-for="note of notesObject"
								:key="note._id"
							>
								<div
									:id="note.subject"
									class="radio"
									:class="checkedStyle(note.subject)"
								>
									<label>{{ note.subject }}</label>
									<input
										type="radio"
										name="note-list"
										:value="JSON.stringify(note)"
										@input="$emit('checked', $event.target)"
									>
								</div>
							</b-row>
						</b-col>
					</b-container>
				</b-collapse>
			</b-row>
		</b-col>
	</b-container>
</template>

<script>
export default {
	props: {
		name: String,
		selectedNoteNode: HTMLElement,
		notesObject: {
			type: Array,
			validator: (notesObjectArray) => notesObjectArray.every((value) => typeof value.subject === 'string' && typeof value.tag === 'string' && typeof value.content === 'string'),
		},
	},
	data() {
		return {
			lazy: true,
			isOpen: false,
			dyWaitClass: undefined,
		};
	},
	methods: {
		checkedStyle(id) {
			const targetNode = document.querySelector(`#${id}`);
			return targetNode ? { checked: targetNode.isSameNode(this.selectedNoteNode) } : undefined;
		},
		uniqueId() {
			const newID = `v-id-${(Math.random() * 10000).toFixed()}`;
			return newID;
		},
		wait() {
			this.dyWaitClass = this.isOpen ? 'wait' : undefined;
		},
	},
};
</script>

<style scoped>
.v-button {
	padding: 0 0.5em;
	border: none;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition-duration: 0.35s;
	font-weight: bold;
	border-bottom-right-radius: 0;
	border-bottom-left-radius: 0;
}

.v-button > span {
	margin: 0 0 0 0.5em;
}

.v-button:hover,
.v-button:active {
	background-color: transparent;
	box-shadow: none;
}

.v-button:focus,
.v-button.active {
	color: var(--light);
	box-shadow: none !important;
}

.v-button.wait {
	transition-delay: 0.35s;
}

.v-button.active:hover {
	background-color: var(--green);
}

.icon {
	width: 0.8em;
	height: 0.8em;
	transition: 0.35s;
}

.icon.r90 {
	transform: rotateZ(90deg);
}

.note-list-env {
	width: 100%;
	padding: 0;
}

.radio {
	width: 100%;
	background-color: var(--green);
	transition: 0.3s;
	border-top: 0.1em solid var(--dark);
}

.collapse .row:last-child > .radio {
	border-radius: 0 0 0.25rem 0.25rem;
}

.radio:hover,
.radio.checked {
	background-color: #12a581;
}

.radio > input[type='radio'] {
	width: 100%;
	height: 2em;
	opacity: 0;
	position: absolute;
	left: 0;
}

.radio > label {
	margin: 0.5em 1em;
}
</style>
