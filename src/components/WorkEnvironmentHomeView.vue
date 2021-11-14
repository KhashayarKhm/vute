<template>
	<div
		v-resize="onResize"
		class="pa-4"
		:class="[!history.length ? 'h-100 d-flex flex-column' : null]"
	>
		<h2
			v-if="history.length"
			class="my-4"
		>
			Recent notes
		</h2>
		<v-row>
			<v-col
				v-if="!history.length"
				class="d-flex align-center"
				cols="12"
			>
				<v-img
					alt="Vute image"
					style="opacity: 0.2;"
					src="@/assets/logo.svg"
					max-width="30rem"
					class="mx-auto"
				/>
			</v-col>
			<v-col
				v-for="(columnList, colIndex) of gridItemList"
				:key="colIndex"
				:cols="12 / columnsInView"
			>
				<transition
					v-for="item of columnList"
					:key="item.id"
					:appear-active-class="`animate__animated animate__bounceIn delay_${200 * item.order}ms`"
					appear
				>
					<v-card
						:color="item.color"
						:title="item.note.subject"
						class="mb-5 preview-card"
						elevation="3"
						@click="openNote(item.note)"
					>
						<v-card-title>
							<span class="text-truncate">{{ item.note.subject }}</span>
						</v-card-title>
						<!-- eslint-disable vue/no-v-html -->
						<v-card-text
							class="content"
							v-html="item.content"
						/>
						<!-- eslint-enable -->
						<v-card-actions>
							<v-icon
								class="mr-1 mirror-y"
								small
							>
								mdi-tag-outline
							</v-icon>
							<v-chip
								:color="item.color + ' accent-2'"
								small
							>
								{{ item.note.tag }}
							</v-chip>
						</v-card-actions>
					</v-card>
				</transition>
			</v-col>
		</v-row>
	</div>
</template>

<script>
export default {
	props: {
		history: {
			type: Array,
			required: true,
			validator(value) {
				return value.every((noteObject) => typeof noteObject.subject === 'string'
				&& typeof noteObject.tag === 'string'
				&& typeof noteObject.content === 'object'
				&& typeof noteObject._id === 'number');
			},
		},
	},
	data() {
		return {
			usedColors: [],
			colors: [
				'red', 'pink', 'purple', 'deep-purple',
				'indigo', 'blue', 'light-blue', 'cyan',
				'teal', 'green', 'lime', 'yellow',
				'amber', 'orange', 'deep-orange',
			],
			columnsInView: 0,
		};
	},
	computed: {
		gridItemList() {
			if (!this.columnsInView || !this.history.length) return [];
			const initialList = Array(this.columnsInView).fill(0).map(() => []);
			return this.history.reduce((list, note, index) => {
				const item = {
					note,
					content: this.generateContent(note.content),
					id: note._id,
					order: index,
					color: this.cardsColor[index],
				};
				list[index % this.columnsInView].push(item);
				return list;
			}, initialList).filter((list) => list.length !== 0);
		},
		cardsColor() {
			return this.history.reduce((colorList) => {
				const availableColors = this.colors.filter((color) => !colorList.includes(color));
				const randomIndex = Math.floor(Math.random() * (availableColors.length - 1));
				return colorList.concat(availableColors[randomIndex]);
			}, []);
		},
	},
	beforeDestroy() {
		this.$root.$children[0].editor.clearContent();
	},
	methods: {
		generateContent(content) {
			this.$root.$children[0].editor.setContent(content);
			return this.$root.$children[0].editor.getHTML();
		},
		onResize() {
			switch (true) {
				case matchMedia('(min-width: 960px)').matches:
					this.columnsInView = 4;
					break;
				case matchMedia('(min-width: 600px)').matches:
					this.columnsInView = 3;
					break;
				default:
					this.columnsInView = 2;
			}
		},
		openNote(note) {
			this.$emit('change', note);
		},
	},
};
</script>

<style lang="scss" scoped>
$time: 200;

@for $i from 1 through 8 {
	.delay_#{$time * $i}ms {
		animation-delay: (0.2 * $i) + s;
	}
}

.preview-card {
	max-height: 18rem;
	.content {
		overflow: hidden;
		max-height: 12rem;
	}
}
</style>

<style lang="scss">
@import '@/styles/_mixins.scss';

.preview-card {
	.content {
		@include content-elements;
		h1, h2, h3, p {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			margin: 0;
		}
	}
}
</style>
