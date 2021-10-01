<template>
	<v-navigation-drawer
		v-resize="onResize"
		:permanent="desktopBreakpoint"
		:value="drawerValue"
		color="blue-grey darken-4"
		app
		dark
		@input="$emit('shift', $event)"
	>
		<template #prepend>
			<v-img
				class="mt-1 mx-4"
				src="@/assets/logo.svg"
				width="60"
				height="40"
				alt="Vute logo"
				contain
			/>
			<v-list-item
				class="mt-2"
				dense
			>
				<v-hover v-slot="{ hover }">
					<v-btn
						:color="hover ? 'blue' : null"
						class="text-decoration-none"
						href="https://github.com/KhashayarKhm/vute"
						target="blank"
						icon
					>
						<v-icon>
							mdi-github
						</v-icon>
					</v-btn>
				</v-hover>
				<v-hover v-slot="{ hover }">
					<v-btn
						:color="hover ? 'orange' : null"
						class="text-decoration-none"
						href="mailto:khashayar.khm@protonmail.com"
						icon
					>
						<v-icon>
							mdi-email
						</v-icon>
					</v-btn>
				</v-hover>
			</v-list-item>
		</template>
		<transition
			enter-active-class="animate__animated animate__fadeInLeft position-absolute animate__faster"
			leave-active-class="animate__animated animate__fadeOutLeft position-absolute animate__faster"
		>
			<v-list
				v-show="!viewNoteList"
				style="width: 100%;"
				dense
				nav
			>
				<v-subheader>Tags</v-subheader>
				<transition
					leave-active-class="animate__animated animate__zoomOut"
				>
					<div
						v-if="!tags.length && tipMessage"
						class="tip-message green accent-3 rounded blue-grey--text text--darken-4"
					>
						<span class="mb-1">Take your first note</span>
						<v-btn
							color="blue-grey darken-4"
							x-small
							plain
							icon
							style="justify-self: end;"
							@click="tipMessage = false"
						>
							<v-icon>mdi-close-circle-outline</v-icon>
						</v-btn>
						<span>Click on "New note" to create a note and browse it here</span>
					</div>
				</transition>
				<v-list-item
					v-for="tag of tags"
					:key="tag"
					class="min-height-min-content"
					@click="selectTag(tag)"
				>
					<v-list-item-icon class="my-1 mr-1">
						<v-icon small>
							mdi-tag
						</v-icon>
					</v-list-item-icon>
					<v-list-item-content class="py-1">
						<span>{{ tag }}</span>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</transition>
		<transition
			enter-active-class="animate__animated animate__fadeInRight position-absolute animate__faster"
			leave-active-class="animate__animated animate__fadeOutRight position-absolute animate__faster"
		>
			<v-list
				v-show="viewNoteList"
				style="width: 100%;"
				dense
				nav
			>
				<v-list-item>
					<v-list-item-content>
						<span>{{ selectedTag }}</span>
					</v-list-item-content>
					<v-btn
						small
						icon
						@click="viewNoteList = false"
					>
						<v-icon dense>
							mdi-close
						</v-icon>
					</v-btn>
				</v-list-item>
				<v-list-item
					v-for="note of tagObject[selectedTag]"
					:key="note._id"
					class="min-height-min-content"
					@click="selectNote(note)"
				>
					<v-list-item-icon class="my-1 mr-1">
						<v-icon small>
							mdi-notebook-outline
						</v-icon>
					</v-list-item-icon>
					<v-list-item-content class="py-1">
						<span>{{ note.subject }}</span>
					</v-list-item-content>
				</v-list-item>
				<v-list-item
					class="min-height-min-content"
					@click="newNote(selectedTag)"
				>
					<v-list-item-icon class="my-1 mr-1">
						<v-icon
							color="green accent-3"
							small
						>
							mdi-notebook-plus-outline
						</v-icon>
					</v-list-item-icon>
					<v-list-item-content class="py-1">
						<span class="green--text text--accent-3">New note</span>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</transition>
		<template #append>
			<v-btn
				color="blue-grey darken-3"
				tile
				block
				@click="newNote('')"
			>
				<v-icon
					class="mx-1"
					color="green accent-3"
					small
				>
					mdi-notebook-plus-outline
				</v-icon>
				<span class="green--text text--accent-3">New note</span>
			</v-btn>
		</template>
	</v-navigation-drawer>
</template>

<script>
export default {
	model: {
		prop: 'value',
		event: 'shift',
	},
	props: {
		tagObject: {
			type: Object,
			required: true,
			validator(value) {
				return Object.values(value).every((tagValue) => tagValue.constructor === Array && tagValue.every((note) => typeof note._id === 'number'));
			},
		},
		value: Boolean,
	},
	data() {
		return {
			tipMessage: true,
			desktopBreakpoint: null,
			drawerValue: false,
			selectedTag: null,
			viewNoteList: false,
		};
	},
	computed: {
		tags() {
			return Object.keys(this.tagObject);
		},
	},
	watch: {
		value(newValue) {
			this.drawerValue = newValue;
		},
	},
	methods: {
		newNote(defaultTag) {
			if (defaultTag) {
				this.viewNoteList = false;
			}
			this.drawerValue = false;
			this.$emit('create', defaultTag);
			this.$emit('shift', false);
		},
		selectTag(value) {
			this.selectedTag = value;
			this.viewNoteList = true;
		},
		selectNote(value) {
			this.viewNoteList = false;
			this.$emit('change', value);
			this.$emit('shift', false);
		},
		onResize() {
			this.desktopBreakpoint = matchMedia('(min-width: 768px)').matches;
		},
	},
};
</script>

<style scoped>
.tip-message {
	display: grid;
	grid-template-rows: 50% 50%;
	grid-template-columns: 85% 15%;
	margin-top: 12px;
	margin-right: 12px;
	padding: 12px;
}
</style>
