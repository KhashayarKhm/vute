<template>
	<div
		class="select"
		role="listbox"
	>
		<div
			class="value form-control"
			:class="{ open: display }"
			@click.capture="display = !display"
		>
			<span style="font-weight: bold">
				{{ selectedOption.value }}
			</span>
			<b-icon-caret-down-fill
				class="icon"
				:class="{ r90: !display }"
			/>
		</div>
		<transition name="display-options">
			<ul
				v-show="display"
				class="optList"
				role="presentation"
			>
				<li class="create-new-tag">
					<b-input-group
						class="w-75"
						style="flex-wrap: nowrap"
					>
						<b-form-input
							v-model="newTagName"
							class="w-auto h-auto p-0 pl-2 pr-2"
							type="text"
							placeholder="new tag"
							@keyup.enter="changeOption(newTagName)"
							@input="setSuggest = $event"
						/>
						<b-input-group-append>
							<b-button
								variant="primary"
								class="p-0 pl-2 pr-2"
								@click="changeOption(newTagName)"
							>
								Add
							</b-button>
						</b-input-group-append>
					</b-input-group>
				</li>
				<transition-group name="display-options">
					<li
						v-for="(option, index) of setSuggest"
						:key="index"
						class="option"
						role="option"
						:data-value="option"
						:aria-selected="selectedOption.index === index"
						:class="{ 'text-danger': selectedOption.index === index, 'border-top': index }"
						@click="changeOption($event)"
					>
						{{ option }}
					</li>
				</transition-group>
			</ul>
		</transition>
	</div>
</template>

<script>
export default {
	props: {
		options: {
			type: Array,
			validator: (optionsArray) => optionsArray.every((value) => typeof value === 'string'),
		},
		selected: String,
		name: String,
	},
	data() {
		return {
			selectedOptionObject: {
				value: this.selected ? this.selected : 'Choose a tag',
				index: this.options.findIndex((option) => option === this.selected),
			},
			display: false,
			newTagName: '',
			suggestOptions: this.options,
			allOptions: [],
		};
	},
	computed: {
		selectedOption: {
			set: function (value) {
				const newValueIndex = this.allOptions.findIndex((tag) => tag === value);
				if (typeof value === 'string' && newValueIndex !== -1) {
					this.selectedOptionObject.value = value;
					this.selectedOptionObject.index = newValueIndex;
				}
			},
			get: function () {
				return this.selectedOptionObject;
			},
		},
		setSuggest: {
			get: function () {
				return this.suggestOptions;
			},
			set: function (text) {
				const suggestList = [];
				this.allOptions.forEach((value) => {
					const textLC = text.toLowerCase();
					const valueLC = value.toLowerCase();
					if (valueLC.indexOf(textLC) !== -1) {
						suggestList.push(value);
					}
				});
				this.selectedOption.index = suggestList.findIndex(
					(optionValue) => optionValue === this.selectedOption.value,
				);
				this.suggestOptions = suggestList;
			},
		},
	},
	watch: {
		selected: function (value) {
			this.selectedOption = value;
		},
		options: function (newOptions) {
			this.allOptions = [...newOptions];
		},
	},
	methods: {
		changeOption: function (event) {
			switch (true) {
			case event && event.constructor === MouseEvent && event.isTrusted:
				this.selectedOption.value = event.target.getAttribute('data-value');
				this.selectedOption.index = this.allOptions.findIndex(
					(tag) => tag === this.selectedOption.value,
				);
				break;
			case !this.newTagName:
				return;
			case this.allOptions.includes(this.newTagName):
				this.selectedOption.index = this.allOptions.findIndex((tag) => tag === this.newTagName);
				this.selectedOption.value = this.newTagName;
				break;
			default:
				this.selectedOption.index = this.allOptions.length;
				this.selectedOption.value = this.newTagName;
				this.allOptions.push(this.newTagName);
			}
			this.display = false;
			setTimeout(() => {
				this.newTagName = '';
				this.setSuggest = '';
			}, 1000);
			this.$emit('input', this.selectedOption.value);
		},
	},
};
</script>

<style scoped>
.icon {
	transition: 0.3s;
}

.icon.r90 {
	transform: rotateZ(90deg);
}

.select {
	position: relative;
}

.select > .value {
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.select > .value.open {
	border-bottom-right-radius: 0;
	border-bottom-left-radius: 0;
}

.select > .value.open {
	border-color: #ced4da;
}

.select > .optList {
	position: absolute;
	top: 100%;
	left: 0;
	width: 100%;
	max-height: 10em;
	overflow-y: scroll;
	background-color: var(--white);
	color: var(--dark);
	list-style: none;
	border-radius: 0 0 0.3em 0.3em;
	padding: 0;
	-ms-overflow-style: none;
	scrollbar-width: none;
	z-index: 1;
}

.select > .optList::-webkit-scrollbar {
	display: none;
}

.select > .optList > .create-new-tag {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 3em;
}

.select > .optList > span > .option {
	padding: 0.25em 0.5em;
}

.option.active {
	color: red;
}

.display-options-enter-active {
	animation: display-options 0.3s;
}

.display-options-leave-active {
	animation: display-options 0.3s reverse;
}

@keyframes display-options {
	0% {
		opacity: 0;
		transform: translateY(-30%);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
