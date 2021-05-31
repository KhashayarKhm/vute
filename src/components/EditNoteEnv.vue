<template>
	<div class="editor">
		<b-modal
			id="make-sure-alert"
			v-model="makeSureAlertVisibility"
			body-bg-variant="primary"
			body-text-variant="light"
			centered
			hide-header
			hide-footer
		>
			<p>{{ isModified() ? 'Do you want to save changes?' : 'Are you sure to discard?' }}</p>
			<div class="d-flex align-content-center justify-content-center">
				<b-button
					v-if="isModified() && !forceExit"
					size="sm"
					variant="success"
					class="mx-1 w-25"
					@click="saveChanges(true)"
				>
					Save
				</b-button>
				<b-button
					size="sm"
					variant="danger"
					class="mx-1 w-25"
					@click="saveChanges(false)"
				>
					Discard
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
		<editor-menu-bar
			v-slot="{ commands, }"
			:editor="editor"
		>
			<div>
				<b-button-toolbar ref="staticToolbar">
					<b-button-group>
						<b-button
							size="sm"
							title="Bold"
							:pressed.sync="textStyle.bold"
							@click="commands.bold"
						>
							<b-icon-type-bold />
						</b-button>

						<b-button
							size="sm"
							title="Italic"
							:pressed.sync="textStyle.italic"
							@click="commands.italic"
						>
							<b-icon-type-italic />
						</b-button>

						<b-button
							size="sm"
							title="Strike"
							:pressed.sync="textStyle.strike"
							@click="commands.strike"
						>
							<b-icon-type-strikethrough />
						</b-button>

						<b-button
							size="sm"
							title="Underline"
							:pressed.sync="textStyle.underline"
							@click="commands.underline"
						>
							<b-icon-type-underline />
						</b-button>

						<b-button
							id="link-popover"
							size="sm"
							:pressed.sync="textStyle.link"
							title="Link"
						>
							<b-icon-link />
						</b-button>
						<b-popover
							target="link-popover"
							:show="showPopover"
							custom-class="link-popover"
							placement="bottom"
							title="Target link"
							@show="link = activeMarkLink || 'https://'"
							@hide="editor.focus()"
						>
							<b-input-group
								class="w-100"
								style="flex-wrap: nowrap"
							>
								<b-form-input
									v-model="link"
									autofocus
									:state="urlValidity"
									class="w-auto h-auto p-0 pl-2 pr-c"
									type="url"
									@keyup.enter="linking(activeMarkLink === link ? null : link)"
								/>
								<b-input-group-append>
									<b-button
										:variant="activeMarkLink === link ? 'danger' : 'primary'"
										class="py-0 px-2"
										@click="linking(activeMarkLink === link ? null : link)"
									>
										{{ activeMarkLink === link ? 'Clear' : 'Link' }}
									</b-button>
								</b-input-group-append>
							</b-input-group>
						</b-popover>
					</b-button-group>
					<template v-if="!collapseToolbarConfig.part1Existing">
						<b-button-group>
							<b-button
								size="sm"
								title="Paragraph"
								:pressed.sync="textStyle.paragraph"
								@click="commands.paragraph"
							>
								<b-icon-paragraph />
							</b-button>

							<b-button
								size="sm"
								title="Header 1"
								:pressed.sync="textStyle.heading1"
								@click="commands.heading({ level: 1 })"
							>
								<b-icon-type-h1 />
							</b-button>

							<b-button
								size="sm"
								title="Header 2"
								:pressed.sync="textStyle.heading2"
								@click="commands.heading({ level: 2 })"
							>
								<b-icon-type-h2 />
							</b-button>

							<b-button
								size="sm"
								title="Header 3"
								:pressed.sync="textStyle.heading3"
								@click="commands.heading({ level: 3 })"
							>
								<b-icon-type-h3 />
							</b-button>
						</b-button-group>
					</template>

					<template v-if="!collapseToolbarConfig.part2Existing">
						<b-button-group>
							<b-button
								size="sm"
								title="Unordered list"
								:pressed.sync="textStyle.bulletList"
								@click="commands.bullet_list"
							>
								<b-icon-list-ul />
							</b-button>

							<b-button
								size="sm"
								title="Ordered list"
								:pressed.sync="textStyle.orderedList"
								@click="commands.ordered_list"
							>
								<b-icon-list-ol />
							</b-button>

							<b-button
								size="sm"
								title="Horizontal rule"
								@click="commands.horizontal_rule"
							>
								<b-icon-hr />
							</b-button>
						</b-button-group>
					</template>
					<template v-if="!collapseToolbarConfig.part3Existing">
						<b-button-group>
							<b-button
								size="sm"
								title="Code"
								:pressed.sync="textStyle.code"
								@click="commands.code"
							>
								<b-icon-code />
							</b-button>

							<b-button
								size="sm"
								title="Blockquote"
								:pressed.sync="textStyle.blockquote"
								@click="commands.blockquote"
							>
								<b-icon-chat-square-quote />
							</b-button>

							<b-button
								size="sm"
								title="Code block"
								:pressed.sync="textStyle.codeBlock"
								@click="commands.code_block"
							>
								<b-icon-code-square />
							</b-button>
						</b-button-group>
					</template>
					<template v-if="!collapseToolbarConfig.part4Existing">
						<b-button-group>
							<b-button
								size="sm"
								title="New line"
								@click="commands.hard_break"
							>
								<b-icon-arrow-return-left />
							</b-button>

							<b-button
								size="sm"
								title="Undo"
								@click="commands.undo"
							>
								<b-icon-skip-backward />
							</b-button>

							<b-button
								size="sm"
								title="Redo"
								@click="commands.redo"
							>
								<b-icon-skip-forward />
							</b-button>
						</b-button-group>
					</template>
					<b-button-group>
						<b-button
							size="sm"
							variant="danger"
							@click="checkEditForm"
						>
							<b-icon-x-circle />
						</b-button>
					</b-button-group>
				</b-button-toolbar>
				<b-collapse
					v-if="
						collapseToolbarConfig.part1Existing ||
							collapseToolbarConfig.part2Existing ||
							collapseToolbarConfig.part3Existing ||
							collapseToolbarConfig.part4Existing
					"
					id="more-commands"
					v-model="collapseVisibility"
					class="w-100 position-absolute"
				>
					<b-button-toolbar class="column">
						<template v-if="collapseToolbarConfig.part1Existing">
							<b-button-group>
								<b-button
									size="sm"
									title="Paragraph"
									:pressed.sync="textStyle.paragraph"
									@click="commands.paragraph"
								>
									<b-icon-paragraph />
								</b-button>

								<b-button
									size="sm"
									title="Header 1"
									:pressed.sync="textStyle.heading1"
									@click="commands.heading({ level: 1 })"
								>
									<b-icon-type-h1 />
								</b-button>

								<b-button
									size="sm"
									title="Header 2"
									:pressed.sync="textStyle.heading2"
									@click="commands.heading({ level: 2 })"
								>
									<b-icon-type-h2 />
								</b-button>

								<b-button
									size="sm"
									title="Header 3"
									:pressed.sync="textStyle.heading3"
									@click="commands.heading({ level: 3 })"
								>
									<b-icon-type-h3 />
								</b-button>
							</b-button-group>
						</template>
						<template v-if="collapseToolbarConfig.part2Existing">
							<b-button-group>
								<b-button
									size="sm"
									title="Unordered list"
									:pressed.sync="textStyle.bulletList"
									@click="commands.bullet_list"
								>
									<b-icon-list-ul />
								</b-button>

								<b-button
									size="sm"
									title="Ordered list"
									:pressed.sync="textStyle.orderedList"
									@click="commands.ordered_list"
								>
									<b-icon-list-ol />
								</b-button>

								<b-button
									size="sm"
									title="Horizontal rule"
									@click="commands.horizontal_rule"
								>
									<b-icon-hr />
								</b-button>
							</b-button-group>
						</template>
						<template v-if="collapseToolbarConfig.part3Existing">
							<b-button-group>
								<b-button
									size="sm"
									title="Code"
									:pressed.sync="textStyle.code"
									@click="commands.code"
								>
									<b-icon-code />
								</b-button>

								<b-button
									size="sm"
									title="Blockquote"
									:pressed.sync="textStyle.blockquote"
									@click="commands.blockquote"
								>
									<b-icon-chat-square-quote />
								</b-button>

								<b-button
									size="sm"
									title="Code block"
									:pressed.sync="textStyle.codeBlock"
									@click="commands.code_block"
								>
									<b-icon-code-square />
								</b-button>
							</b-button-group>
						</template>
						<template v-if="collapseToolbarConfig.part4Existing">
							<b-button-group>
								<b-button
									size="sm"
									title="New line"
									@click="commands.hard_break"
								>
									<b-icon-arrow-return-left />
								</b-button>

								<b-button
									size="sm"
									title="Undo"
									@click="commands.undo"
								>
									<b-icon-skip-backward />
								</b-button>

								<b-button
									size="sm"
									title="Redo"
									@click="commands.redo"
								>
									<b-icon-skip-forward />
								</b-button>
							</b-button-group>
						</template>
					</b-button-toolbar>
				</b-collapse>
				<button
					v-if="
						collapseToolbarConfig.part1Existing ||
							collapseToolbarConfig.part2Existing ||
							collapseToolbarConfig.part3Existing ||
							collapseToolbarConfig.part4Existing
					"
					type="button"
					:class="{ open: collapseVisibility }"
					class="toggle-collapse-button text-light bg-dark"
					:aria-expanded="collapseVisibility"
					aria-controls="more-commands"
					@click="collapseVisibility = !collapseVisibility"
				>
					<b-icon-chevron-double-down
						:class="{ r180: collapseVisibility }"
						style="transition: 0.5s"
					/>
				</button>
			</div>
		</editor-menu-bar>

		<b-form class="add-form">
			<b-form-group
				id="subject-group"
				label="Subject:"
				label-class="h4 m-0"
				label-for="subject-input"
			>
				<b-form-input
					id="subject-input"
					v-model="newNoteObject.subject"
					type="text"
					required
				/>
			</b-form-group>
			<b-form-group
				id="tag-group"
				label="Tag:"
				label-class="h4 m-0"
				label-for="tag-input"
			>
				<insertion-select
					v-model="newNoteObject.tag"
					:options="tags"
					:selected="newNoteObject.tag"
				/>
			</b-form-group>
			<hr
				class="border border-primary w-100 mt-0"
			>
			<editor-content
				class="editor__content"
				:editor="editor"
			/>
		</b-form>
	</div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
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
	Placeholder,
	Strike,
	Underline,
} from 'tiptap-extensions';
import InsertionSelect from './InsertionSelect.vue';

export default {
	components: {
		EditorContent,
		EditorMenuBar,
		InsertionSelect,
	},
	props: {
		note: {
			validator: (value) => typeof value.subject === 'string' && typeof value.tag === 'string' && typeof value.content === 'string',
		},
		tags: {
			type: Array,
			validator: (tagsArray) => tagsArray.every((value) => typeof value === 'string'),
		},
	},
	data() {
		return {
			makeSureAlertVisibility: false,
			collapseVisibility: false,
			newNoteObject: { subject: '', content: '', tag: '' },
			link: null,
			urlRegExp:
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)/,
			showPopover: null,
			forceExit: false,
			collapseToolbarConfig: {
				part1Existing: false,
				part2Existing: false,
				part3Existing: false,
				part4Existing: false,
			},
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
					new Placeholder({ emptyNodeText: 'Content...' }),
					new Strike(),
					new Underline(),
				],
			}),
		};
	},
	computed: {
		urlValidity() {
			return this.link ? this.urlRegExp.test(this.link) : null;
		},
		activeMarkLink() {
			return this.editor.activeMarkAttrs.link.href;
		},
		textStyle() {
			return {
				bold: this.editor.isActive.bold(),
				italic: this.editor.isActive.italic(),
				strike: this.editor.isActive.strike(),
				underline: this.editor.isActive.underline(),
				link: this.editor.isActive.link(),
				paragraph: this.editor.isActive.paragraph(),
				heading1: this.editor.isActive.heading({ level: 1 }),
				heading2: this.editor.isActive.heading({ level: 2 }),
				heading3: this.editor.isActive.heading({ level: 3 }),
				bulletList: this.editor.isActive.bullet_list(),
				orderedList: this.editor.isActive.ordered_list(),
				code: this.editor.isActive.code(),
				blockquote: this.editor.isActive.blockquote(),
				codeBlock: this.editor.isActive.code_block(),
			};
		},
	},
	watch: {
		note(value) {
			this.newNoteObject = { subject: value.subject, content: value.content, tag: value.tag };
			this.editor.setContent(value.content);
		},
	},
	mounted() {
		this.organizedToolbar();
		window.addEventListener('resize', this.organizedToolbar);
	},
	methods: {
		isModified(target) {
			this.newNoteObject.content = this.editor.getHTML();
			switch (target) {
			case 'subject':
				return this.newNoteObject.subject !== this.note.subject;
			case 'tag':
				return this.newNoteObject.tag !== this.note.tag;
			case 'content':
				return this.newNoteObject.content !== this.note.content;
			default:
				return (
					this.newNoteObject.subject !== this.note.subject
					|| this.newNoteObject.tag !== this.note.tag
					|| this.newNoteObject.content !== this.note.content
				);
			}
		},
		checkEditForm() {
			this.forceExit = (this.newNoteObject.subject === '' || this.newNoteObject.tag === '');
			this.makeSureAlertVisibility = true;
		},
		linking(url) {
			if (this.urlValidity) {
				this.editor.commands.link({ href: url });
			}
			this.showPopover = false;
			setTimeout(function () { this.showPopover = null; }, 50);
		},
		saveChanges(save) {
			const saveValue = typeof save !== 'boolean' ? false : save;
			let modifiedNote = null;
			if (saveValue) {
				modifiedNote = {};
				if (this.isModified('subject')) {
					modifiedNote.subject = this.newNoteObject.subject;
				}
				if (this.isModified('tag')) {
					modifiedNote.tag = this.newNoteObject.tag;
				}
				if (this.isModified('content')) {
					modifiedNote.content = this.newNoteObject.content;
				}
			}
			this.makeSureAlertVisibility = false;
			setTimeout(() => {
				this.forceExit = true;
				this.editor.clearContent();
			}, 1000);
			this.$emit('exit', modifiedNote);
		},
		organizedToolbar() {
			switch (true) {
			case window.matchMedia('(min-width: 1200px)').matches:
				this.collapseToolbarConfig.part1Existing = false;
				this.collapseToolbarConfig.part2Existing = false;
				this.collapseToolbarConfig.part3Existing = false;
				this.collapseToolbarConfig.part4Existing = false;
				break;
			case window.matchMedia('(min-width: 993px)').matches:
				this.collapseToolbarConfig.part1Existing = false;
				this.collapseToolbarConfig.part2Existing = false;
				this.collapseToolbarConfig.part3Existing = false;
				this.collapseToolbarConfig.part4Existing = true;
				break;
			case window.matchMedia('(min-width: 768px)').matches:
				this.collapseToolbarConfig.part1Existing = false;
				this.collapseToolbarConfig.part2Existing = true;
				this.collapseToolbarConfig.part3Existing = true;
				this.collapseToolbarConfig.part4Existing = true;
				break;
			case window.matchMedia('(min-width: 620px)').matches:
				this.collapseToolbarConfig.part1Existing = false;
				this.collapseToolbarConfig.part2Existing = false;
				this.collapseToolbarConfig.part3Existing = true;
				this.collapseToolbarConfig.part4Existing = true;
				break;
			case window.matchMedia('(min-width: 480px)').matches:
				this.collapseToolbarConfig.part1Existing = false;
				this.collapseToolbarConfig.part2Existing = true;
				this.collapseToolbarConfig.part3Existing = true;
				this.collapseToolbarConfig.part4Existing = true;
				break;
			default:
				this.collapseToolbarConfig.part1Existing = true;
				this.collapseToolbarConfig.part2Existing = true;
				this.collapseToolbarConfig.part3Existing = true;
				this.collapseToolbarConfig.part4Existing = true;
			}
		},
	},
};
</script>

<style scoped>
.editor {
	width: 100%;
	height: 100%;
	background-color: var(--light);
	color: var(--dark);
	border-radius: 0.5rem;
}

.btn-toolbar {
	width: 100%;
	height: 3.5rem;
	padding: 0 0.25em;
	justify-content: space-around;
	align-items: center;
	border-radius: 0.5rem 0.5rem 0 0;
	background-color: var(--dark);
	z-index: 2;
	position: relative;
}

.btn-toolbar.column {
	height: 5rem;
	border-radius: 0;
	display: grid;
	grid-template-columns: 48% 40%;
	grid-template-rows: 50% 50%;
	grid-column-gap: 2%;
	justify-items: center;
}

.toggle-collapse-button {
	position: absolute;
	top: 2rem;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	justify-content: center;
	align-items: end;
	border: none;
	font-size: 0.8em;
	width: 5em;
	height: 3em;
	border-radius: 50%;
	z-index: 1;
	transition: 0.3s;
}

.toggle-collapse-button.open {
	transform: translate(-50%, 5rem);
}

.r180 {
	transform: rotateZ(180deg);
}

.add-form {
	width: 100%;
	height: calc(100% - 3.5rem);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	padding: 1em;
}

.add-form > .form-group {
	display: grid;
	grid-template-columns: 50% 50%;
	grid-template-rows: 100%;
	align-items: center;
	width: 100%;
}

.editor__content {
	width: 100%;
	height: 50%;
}

.link-popover {
	display: flex;
	flex-direction: column;
}

.pr-c {
	padding-right: 2rem !important;
}

@media screen and (min-width: 480px) {
	.btn-toolbar.column {
		height: 2.5rem;
		grid-template-rows: 100%;
		grid-template-columns: 30% 30% 30%;
	}

	.toggle-collapse-button.open {
		transform: translate(-50%, 2.5rem);
	}
}
</style>
