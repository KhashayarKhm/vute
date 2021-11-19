<template>
	<v-app-bar
		color="blue-grey darken-3"
		app
		dark
		dense
		hide-on-scroll
	>
		<transition
			enter-active-class="animate__animated animate__fadeInDown position-absolute pr-8"
			leave-active-class="animate__animated animate__fadeOutUp position-absolute pr-8"
		>
			<div
				v-show="!viewEditTools"
				class="app-bar"
			>
				<v-tabs
					v-model="selectedTab"
					class="tabs"
					background-color="blue-grey darken-3"
					height="1.5rem"
					active-class="accent-3 text--darken-4"
					hide-slider
					fixed-tabs
					show-arrows
				>
					<transition
						v-for="tab of tabs"
						:key="tab.id"
						name="tab"
						appear
						appear-active-class="tab-appear-active"
					>
						<v-tab
							class="
							tab rounded green lighten-2 ml-1
							grey--text text--darken-2 px-0
							text-none justify-space-between"
							:ripple="false"
							@click="$emit('change', tab.value)"
						>
							<div class="tab-content">
								<v-icon
									color="blue-grey darken-4"
									small
								>
									{{ tab.icon }}
								</v-icon>
								<span class="text-truncate tab-text">
									{{ tab.text }}
								</span>
							</div>
							<v-btn
								color="grey darken-4 mr-2"
								icon
								x-small
								@click="tabs = { value: tab.value, rm: true }"
							>
								<v-icon x-small>
									mdi-close
								</v-icon>
							</v-btn>
						</v-tab>
					</transition>
				</v-tabs>
				<v-btn
					class="mx-1"
					icon
					small
					@click="tabs = { value: 'home', rm: false }"
				>
					<v-icon dense>
						mdi-home-outline
					</v-icon>
				</v-btn>
			</div>
		</transition>
		<transition
			enter-active-class="animate__animated animate__fadeInDown position-absolute pr-8"
			leave-active-class="animate__animated animate__fadeOutUp position-absolute pr-8"
		>
			<div
				v-if="viewEditTools"
				v-resize="onResize"
				class="toolbar"
			>
				<v-btn
					icon
					small
					@click="$emit('update:viewEditTools', false)"
				>
					<v-icon small>
						mdi-arrow-left
					</v-icon>
				</v-btn>
				<div class="toolbar-content">
					<v-btn-toggle
						v-for="(buttonGroupOrder, buttonGroupIndex) of buttonGroupsInToolbar"
						:key="buttonGroupIndex"
						:value="buttonGroupsValue[buttonGroupIndex]"
						:multiple="buttonGroupIndex === 0 ? true : false"
						dense
						rounded
					>
						<v-btn
							v-for="button of buttonGroups[buttonGroupIndex]"
							:ref="button.name === 'link' ? 'linkMenuActivator' : null"
							:key="button.name"
							:title="button.name | capitalize"
							:name="button.name | capitalize"
							small
							@click="changeFormat(button.name)"
						>
							<v-icon small>
								{{ button.icon }}
							</v-icon>
						</v-btn>
					</v-btn-toggle>
					<v-menu
						v-model="viewLinkMenu"
						transition="slide-y-transition"
						:close-on-content-click="false"
						:position-x="linkMeunPositionX"
						:position-y="50"
						absolute
					>
						<v-card
							class="px-2 py-4"
							width="25em"
							elevation="3"
							rounded
							dark
						>
							<v-row class="mx-0">
								<v-col
									cols="8"
									md="10"
									class="py-2"
								>
									<v-text-field
										v-model="urlInputValue"
										:rules="[urlValidity]"
										label="URL"
										placeholder="https://"
										autofocus
										clearable
										outlined
										hide-details
										dense
									/>
								</v-col>
								<v-col
									cols="2"
									md="1"
									class="py-2 px-md-1 d-flex justify-center align-center"
								>
									<v-btn
										color="green"
										:disabled="!urlValidity"
										fab
										x-small
										@click="changeFormat('link', urlInputValue)"
									>
										<v-icon small>
											mdi-link-variant-plus
										</v-icon>
									</v-btn>
								</v-col>
								<v-col
									cols="2"
									md="1"
									class="py-2 px-md-1 d-flex justify-center align-center"
								>
									<v-btn
										:disabled="!buttonGroups[0][4].isActive"
										color="red"
										fab
										x-small
										@click="changeFormat('link', '')"
									>
										<v-icon small>
											mdi-link-variant-minus
										</v-icon>
									</v-btn>
								</v-col>
							</v-row>
						</v-card>
					</v-menu>
				</div>
				<v-menu
					transition="slide-x-reverse-transition"
					content-class="rounded-0 rounded-bl menu-position"
					dark
				>
					<template #activator="{ on, attrs }">
						<v-btn
							icon
							small
							v-bind="attrs"
							v-on="on"
						>
							<v-icon small>
								mdi-menu
							</v-icon>
						</v-btn>
					</template>
					<v-list dense>
						<div
							v-for="buttonGroupIndex of remainingButtonGroupIndexes"
							:key="buttonGroupIndex"
						>
							<v-divider
								v-if="buttonGroupIndex !== buttonGroupsInToolbar"
							/>
							<v-list-item
								v-for="button of buttonGroups[buttonGroupIndex]"
								:key="button.name"
								:class="{ 'v-list-item--active': button.isActive, }"
								@click="changeFormat(button.name)"
							>
								<v-list-item-icon>
									<v-icon small>
										{{ button.icon }}
									</v-icon>
								</v-list-item-icon>
								<v-list-item-content>
									<span>{{ button.name | capitalize }}</span>
								</v-list-item-content>
							</v-list-item>
						</div>
					</v-list>
				</v-menu>
			</div>
		</transition>
	</v-app-bar>
</template>

<script>
export default {
	filters: {
		capitalize(value) {
			const string = String(value);
			const numbersOrCapitalLetters = string.match(/[A-Z]|\d+/) || [];
			return numbersOrCapitalLetters
				.reduce((capitalizedText, char) => capitalizedText.replace(char, ` ${char.toLowerCase()}`), string)
				.replace(string.at(0), string.at(0) === '_' ? '' : string.at(0).toUpperCase())
				.replaceAll('_', ' ');
		},
	},
	model: {
		prop: 'currentTab',
		event: 'change',
	},
	props: {
		viewEditTools: Boolean,
		currentTab: undefined,
		editorObject: {
			type: Object,
			required: true,
		},
		removeTab: {
			type: Number,
			default: null,
		},
		allNotes: {
			type: Object,
			required: true,
			validator(value) {
				return Object.values(value).every(
					(noteList) => Array.isArray(noteList)
					&& noteList.every((note) => note.constructor === Object),
				);
			},
		},
	},
	data() {
		return {
			selectedTab: 0,
			tabClasses: 'tab rounded blue-grey ml-1 grey--text text--darken-3 px-0 text-none justify-space-between',
			tabsData: ['home'],
			buttonGroupsInToolbar: 1,
			buttonGroups: [
				[
					{
						name: 'bold',
						icon: 'mdi-format-bold',
						isActive: null,
					},
					{
						name: 'italic',
						icon: 'mdi-format-italic',
						isActive: this.editorObject.isActive.italic(),
					},
					{
						name: 'strike',
						icon: 'mdi-format-strikethrough',
						isActive: this.editorObject.isActive.strike(),
					},
					{
						name: 'underline',
						icon: 'mdi-format-underline',
						isActive: this.editorObject.isActive.underline(),
					},
					{
						name: 'link',
						icon: 'mdi-link',
						isActive: this.editorObject.isActive.link(),
					},
				],
				[
					{
						name: 'paragraph',
						icon: 'mdi-format-paragraph',
						isActive: this.editorObject.isActive.paragraph(),
					},
					{
						name: 'heading1',
						icon: 'mdi-format-header-1',
						isActive: this.editorObject.isActive.heading({ level: 1 }),
					},
					{
						name: 'heading2',
						icon: 'mdi-format-header-2',
						isActive: this.editorObject.isActive.heading({ level: 2 }),
					},
					{
						name: 'heading3',
						icon: 'mdi-format-header-3',
						isActive: this.editorObject.isActive.heading({ level: 3 }),
					},
				],
				[
					{
						name: 'bullet_list',
						icon: 'mdi-format-list-bulleted',
						isActive: this.editorObject.isActive.bullet_list(),
					},
					{
						name: 'ordered_list',
						icon: 'mdi-order-numeric-ascending',
						isActive: this.editorObject.isActive.ordered_list(),
					},
					{
						name: 'horizontal_rule',
						icon: 'mdi-minus',
						isActive: this.editorObject.isActive.horizontal_rule(),
					},
				],
				[
					{
						name: 'code',
						icon: 'mdi-code-braces',
						isActive: this.editorObject.isActive.code(),
					},
					{
						name: 'code_block',
						icon: 'mdi-code-braces-box',
						isActive: this.editorObject.isActive.code_block(),
					},
					{
						name: 'blockquote',
						icon: 'mdi-comment-quote',
						isActive: this.editorObject.isActive.blockquote(),
					},
				],
				[
					{
						name: 'hard_break',
						icon: 'mdi-subdirectory-arrow-left',
					},
					{
						name: 'undo',
						icon: 'mdi-undo',
					},
					{
						name: 'redo',
						icon: 'mdi-redo',
					},
				],
			],
			viewLinkMenu: false,
			urlInputValue: '',
		};
	},
	computed: {
		tabs: {
			set(obj) {
				const { value } = obj;
				const valueIndex = Object.values(this.tabsData)
					.findIndex((noteObject) => noteObject._id === value._id);
				if (!obj.rm) {
					if (value instanceof Object) {
						// Open tab
						if (this.tabsData.length === 1 && this.tabsData[0] === 'home') {
							this.tabsData = this.tabsData.slice(1).concat(value);
						} else if (valueIndex === -1) {
							this.tabsData = this.tabsData.concat(value);
							this.selectedTab = this.tabsData.length - 1;
						} else {
							this.$set(this.tabsData, valueIndex, value);
							this.selectedTab = valueIndex;
						}
					} else {
						// Open home tab
						const homeIndex = this.tabsData.findIndex((tab) => tab === 'home');
						if (homeIndex !== -1) {
							this.selectedTab = homeIndex;
						} else {
							this.tabsData = this.tabsData.concat('home');
							this.selectedTab = this.tabsData.length - 1;
						}
						this.$emit('change', 'home');
					}
				} else if (valueIndex !== -1) {
					// Close tab (if exist)
					this.tabsData = this.tabsData.filter((tab) => tab._id !== value._id);
					if (!this.tabsData.length) {
						this.tabsData = this.tabsData.concat('home');
					}
					this.$emit('change', this.tabsData[valueIndex] || this.tabsData[valueIndex - 1]);
				}
			},
			get() {
				return this.tabsData.map((item) => {
					switch (item) {
						case 'home':
							return {
								text: 'Home',
								icon: 'mdi-home-outline',
								id: 'home',
								value: item,
							};
						default:
							return {
								text: item.subject,
								icon: 'mdi-notebook-outline',
								id: item._id,
								value: item,
							};
					}
				});
			},
		},
		urlValidity() {
			// eslint-disable-next-line
			const urlRegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
			return urlRegExp.test(this.urlInputValue);
		},
		remainingButtonGroupIndexes() {
			return Array(5 - this.buttonGroupsInToolbar)
				.fill(null)
				.map((item, index) => this.buttonGroupsInToolbar + index);
		},
		buttonGroupsValue() {
			return this.buttonGroups
				.slice(0, this.buttonGroups.length - 1)
				.map((buttonGroup, index) => {
					if (index === 0) {
						return buttonGroup.map((buttonObject, btnIndex) => {
							if (buttonObject.isActive) return btnIndex;
							return null;
						})
							.filter((value) => typeof value === 'number');
					}
					return buttonGroup.findIndex((buttonObject) => buttonObject.isActive);
				});
		},
		linkMeunPositionX() {
			return (document.body.scrollWidth - 256) / 2;
		},
	},
	watch: {
		currentTab(value) {
			this.tabs = { value, rm: false };
		},
		'editorObject.isActive': function activateWatcher(activateObject) {
			const ignoredCommands = ['doc', 'text', 'redo', 'undo', 'hard_break', 'list_item'];
			Object.keys(activateObject).forEach((commandName) => {
				if (!ignoredCommands.includes(commandName)) {
					if (commandName === 'heading') {
						[1, 2, 3].forEach((level) => {
							const commandObject = this.buttonGroups.find((buttonGroup) => buttonGroup
								.find((buttonObject) => buttonObject.name === `heading${level}`))
								.find((buttonObject) => buttonObject.name === `heading${level}`);
							this.$set(commandObject, 'isActive', activateObject[commandName]({ level }));
						});
					} else {
						const commandObject = this.buttonGroups.find((buttonGroup) => buttonGroup
							.find((buttonObject) => buttonObject.name === commandName))
							.find((buttonObject) => buttonObject.name === commandName);
						this.$set(commandObject, 'isActive', activateObject[commandName]());
					}
				}
			});
		},
		viewLinkMenu(value) {
			if (value) {
				this.urlInputValue = this.editorObject.activeMarkAttrs.link.href;
			}
		},
		removeTab(value) {
			if (typeof value === 'number') {
				this.tabs = { value, rm: true };
				this.$emit('update:removeTab', null);
			}
		},
	},
	methods: {
		onResize() {
			switch (true) {
				case matchMedia('(min-width: 1264px)').matches:
					this.buttonGroupsInToolbar = 4;
					break;
				case matchMedia('(min-width: 960px)').matches:
					this.buttonGroupsInToolbar = 3;
					break;
				case matchMedia('(min-width: 768px)').matches:
					this.buttonGroupsInToolbar = 1;
					break;
				case matchMedia('(min-width: 600px)').matches:
					this.buttonGroupsInToolbar = 2;
					break;
				default:
					this.buttonGroupsInToolbar = 1;
			}
		},
		changeFormat(command, value) {
			switch (command) {
				case 'heading1':
					this.editorObject.commands.heading({ level: 1 });
					break;
				case 'heading2':
					this.editorObject.commands.heading({ level: 2 });
					break;
				case 'heading3':
					this.editorObject.commands.heading({ level: 3 });
					break;
				case 'link':
					if (typeof value === 'string') {
						if (this.urlValidity) {
							this.editorObject.commands.link({ href: value });
						}
					} else {
						this.viewLinkMenu = !this.viewLinkMenu;
					}
					break;
				default:
					this.editorObject.commands[command]();
			}
		},
	},
};
</script>

<style lang="scss" scoped>
.app-bar {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.tabs {
	width: calc(100% - 32px);

	.tab {
		max-width: 10rem;
		transition: .3s;

		.tab-content {
			display: flex;
			align-items: center;
			margin-left: 4px;
			width: calc(100% - 24px);

			.tab-text {
				width: calc(100% - 16px - 2px);
				margin-left: 2px;
				text-align: left;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}
}

.toolbar {
	display: grid;
	grid-template-rows: 100%;
	grid-template-columns: 30px calc(100% - 60px) 30px;
	justify-content: center;
	align-items: center;
	width: 100%;
	.toolbar-content {
		width: 100%;
		display: flex;
		justify-content: space-around;
	}
}

.tab-appear-active {
	animation: resize .3s reverse;
}

.tab-leave-active {
	animation: resize .3s;
}

.menu-position {
	right: 0;
	left: unset !important;
	top: 48px !important;
	position: absolute;
}

@keyframes resize {
	from {
		max-width: 10rem;
		min-width: 90px;
		opacity: 1;
	}
	to {
		max-width: 0;
		min-width: 0;
		opacity: 0;
	}
}
</style>
