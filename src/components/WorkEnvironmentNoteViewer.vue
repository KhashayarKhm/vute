<template>
	<v-sheet
		class="px-6 py-5"
		color="blue-grey darken-4"
		dark
		tile
	>
		<div class="d-flex justify-space-between align-center">
			<h1>{{ note.subject }}</h1>
			<div>
				<v-btn
					class="orange mx-1"
					icon
					small
					@click="$emit('edit')"
				>
					<v-icon
						color="black"
						small
					>
						mdi-pencil-outline
					</v-icon>
				</v-btn>
				<v-dialog
					v-model="deleteMessage"
					max-width="25rem"
				>
					<template #activator="{ attrs, on }">
						<v-btn
							class="red mx-1"
							icon
							depressed
							small
							v-bind="attrs"
							v-on="on"
						>
							<v-icon
								color="black"
								small
							>
								mdi-trash-can-outline
							</v-icon>
						</v-btn>
					</template>
					<v-card
						color="red accent-4"
					>
						<v-card-title>
							<h3>WARNING!</h3>
						</v-card-title>
						<v-card-text class="d-flex justify-center">
							<span class="text-h6">Are you sure to want delete this note?</span>
						</v-card-text>
						<v-card-actions class="justify-center">
							<v-btn
								outlined
								small
								@click="deleteMessage = false"
							>
								<v-icon small>
									mdi-cancel
								</v-icon>
								<span>Cancel</span>
							</v-btn>
							<v-btn
								color="black"
								dark
								small
								@click="removeNote"
							>
								<v-icon small>
									mdi-trash-can-outline
								</v-icon>
								<span>Delete</span>
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</div>
		</div>
		<v-divider class="my-5" />
		<div class="mb-5">
			<v-icon
				class="mirror-y"
				small
			>
				mdi-tag-outline
			</v-icon>
			<v-chip
				class="mx-1"
				small
			>
				{{ note.tag }}
			</v-chip>
		</div>
		<!-- eslint-disable vue/no-v-html -->
		<div
			class="note-content"
			v-html="noteContent"
		/>
		<!--eslint-enable-->
	</v-sheet>
</template>

<script>
export default {
	props: {
		note: {
			validator(noteObject) {
				return typeof noteObject.tag === 'string' && typeof noteObject.content === 'object';
			},
			required: true,
		},
	},
	data() {
		return {
			deleteMessage: false,
		};
	},
	computed: {
		noteContent() {
			this.$root.$children[0].editor.setContent(this.note.content);
			return this.$root.$children[0].editor.getHTML();
		},
	},
	beforeDestroy() {
		this.$root.$children[0].editor.clearContent();
	},
	methods: {
		removeNote() {
			this.$emit('remove', this.note, true);
			this.deleteMessage = false;
		},
	},
};
</script>

<style lang="scss">
@import '@/styles/_mixins';

.note-content {
	@include content-elements;
	word-wrap: break-word;
}
</style>
