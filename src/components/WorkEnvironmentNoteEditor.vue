<template>
	<v-sheet
		v-resize="computedEditorHeight"
		class="px-6 py-5 h-100"
		color="blue-grey darken-3"
		dark
		tile
	>
		<v-form>
			<!-- Header input -->
			<v-text-field
				v-model="newSubject"
				class="input-max-height-43 text-h4 font-weight-medium"
				label="Subject"
				outlined
				hide-details
			/>
			<v-divider class="my-5" />
			<!-- Tag input -->
			<v-combobox
				v-model="selectedTag"
				:items="computedTags"
				:hint="tagInputMessage"
				:menu-props="{
					transition: 'slide-y-transition',
					contentClass: 'rounded-b',
				}"
				:class="tagInputClass"
				label="Tag"
				deletable-chips
				dense
				outlined
				hide-selected
				@focus="focusOnTagInput = true"
				@blur="focusOnTagInput = false"
			>
				<template #selection="{ attrs, item, parent }">
					<v-chip
						v-bind="attrs"
						color="green accent-3"
						small
						light
					>
						<span class="mr-2">
							{{ item }}
						</span>
						<v-icon
							small
							@click="parent.deleteCurrentItem"
						>
							$delete
						</v-icon>
					</v-chip>
				</template>
			</v-combobox>
			<!-- Content input -->
			<v-input
				ref="editorInput"
				:class="{
					'v-input--is-label-active': !!$root.$children[0].editor.state.doc.textContent,
					'v-input--is-dirty': !!$root.$children[0].editor.state.doc.textContent,
					'v-input--is-focused': $root.$children[0].editor.focused,
				}"
				class="v-textarea v-text-field v-text-field--is-booted
				v-text-field--enclosed v-text-field--outlined h-100"
				color="blue"
				hide-details
			>
				<fieldset area-hidden="true">
					<legend
						:style="{
							width:
								!!$root.$children[0].editor.state.doc.textContent
								|| $root.$children[0].editor.focused
									? '38.25px' : 0
						}"
					>
						<span class="notranslate">&#8203;</span>
					</legend>
				</fieldset>
				<div class="v-text-field__slot">
					<label
						:class="{
							'v-label--active':
								!!$root.$children[0].editor.state.doc.textContent
								|| $root.$children[0].editor.focused
						}"
						class="v-label theme--dark"
						style="left: 0px; right: auto; position: absolute;"
						for="editor-input"
					>
						Content
					</label>
					<editor-content
						id="editor-input"
						:style="{ height: `${editorInputHeight}px` }"
						:editor="$root.$children[0].editor"
						spellcheck="false"
					/>
				</div>
			</v-input>
		</v-form>
	</v-sheet>
</template>

<script>
import {
	EditorContent,
} from 'tiptap';

export default {
	components: {
		EditorContent,
	},
	props: {
		note: {
			type: undefined,
			default: () => ({}),
		},
		tags: {
			required: true,
			type: Array,
			validator: (tagsArray) => tagsArray.every((value) => typeof value === 'string'),
		},
		defaultTag: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			newSubject: null,
			selectedTag: null,
			editorInputHeight: null,
			focusOnTagInput: null,
		};
	},
	computed: {
		tagInputClass() {
			return !this.tagInputMessage && this.focusOnTagInput ? 'rounded-b-0' : null;
		},
		computedTags() {
			return this.tags.includes('Other')
				? this.tags
				: this.tags.concat('Other');
		},
		tagInputMessage() {
			return this.computedTags.length === 1 && this.selectedTag ? 'No tag! Type to create one.' : null;
		},
	},
	mounted() {
		if (typeof this.defaultTag === 'string') {
			this.selectedTag = this.defaultTag;
		} else {
			this.$root.$children[0].editor.setContent(this.note.content);
			this.newSubject = this.note.subject;
			this.selectedTag = this.note.tag;
		}
	},
	beforeDestroy() {
		const mutateResult = this.checkMutate();
		const mutateObject = mutateResult ? {
			object: Object.assign(typeof this.defaultTag !== 'string' ? this.note : ({}), mutateResult),
			new: typeof this.defaultTag === 'string',
		} : null;
		this.$emit('exit', mutateObject);
		this.$root.$children[0].editor.clearContent();
	},
	methods: {
		computedEditorHeight() {
			const availableHeight = this.$el.scrollHeight - 60;
			const otherElementsSurroundings = 163;
			this.editorInputHeight = availableHeight - otherElementsSurroundings;
		},
		checkMutate() {
			const mutateObject = {};
			// Check subject
			if ((typeof this.defaultTag === 'string' && this.newSubject)
			|| (this.newSubject && this.newSubject !== this.note.subject)) {
				Object.defineProperty(mutateObject, 'subject', {
					value: this.newSubject,
					enumerable: true,
				});
			}
			// Check tag
			if ((typeof this.defaultTag === 'string' && this.selectedTag)
			|| (this.selectedTag && this.selectedTag !== this.note.tag)) {
				Object.defineProperty(mutateObject, 'tag', {
					value: this.selectedTag || 'Other',
					enumerable: true,
				});
			}
			// Check content
			if (typeof this.defaultTag !== 'string') {
				const currentContent = this.$root.$children[0].editor.getHTML();
				// Set the old content to export it as HTML string
				this.$root.$children[0].editor.setContent(this.note.content);
				const noteContent = this.$root.$children[0].editor.getHTML();
				// Return to edited content
				this.$root.$children[0].editor.setContent(currentContent);
				if (currentContent !== noteContent) {
					Object.defineProperty(mutateObject, 'content', {
						value: this.$root.$children[0].editor.getJSON(),
						enumerable: true,
					});
				}
			} else if (this.newSubject && this.selectedTag) {
				Object.defineProperty(mutateObject, 'content', {
					value: this.$root.$children[0].editor.getJSON(),
					enumerable: true,
				});
			}
			// Result
			const mutateProps = Object.keys(mutateObject).length;
			return (typeof this.defaultTag === 'string' && mutateProps !== 3) || mutateProps === 0
				? null : mutateObject;
		},
	},
};
</script>

<style lang="scss">
@import '@/styles/_mixins';

#editor-input {
	padding-right: 12px;
	margin: 10px 0;
	align-self: stretch;
	flex: 1 1 auto;
	max-width: 100%;
	width: 100px;
	background-color: transparent;
	border-style: none;
	overflow: auto;
	.ProseMirror {
		@include content-elements;
		min-height: 100%;
		color: #FFFFFF;
		outline: none;
		overflow: auto;
	}
}

.input-max-height-43 {
	input {
		max-height: 43px !important;
	}
}
</style>
