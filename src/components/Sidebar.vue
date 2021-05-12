<template>
  <div>
    <b-sidebar bg-variant="primary" text-variant="teal" :lazy="true" :backdrop="toggle" backdrop-variant="dark"
    id="note-list" v-model="sidebarVisibility" title="V-Note" sidebar-class="dynamic-sidebar-width">
      <template #header="{ hide, }">
        <strong>Note list</strong>
        <b-button v-if="toggle" size="sm" class="close" @click="hide()">
          <b-icon-x />
        </b-button>
      </template>
      <b-container fluid>
        <b-col cols="12" class="mt-4">
          <b-row v-for="noteTag of tags" :key="noteTag" align-h="center" class="mt-1">
            <NoteTag :name="noteTag" :notesObject="notes[noteTag]" :selected-note-node="selectedNoteNode"
            @checked="switchNote($event)" />
          </b-row>
        </b-col>
      </b-container>
      <template #footer>
        <b-container fluid>
          <b-col cols="12">
            <b-row align-h="center" align-v="end" class="my-4">
              <b-button class="v-button" block variant="light" @click="addNote">
                <span>Add new note</span>
                <b-icon-plus/>
              </b-button>
            </b-row>
          </b-col>
        </b-container>
      </template>
    </b-sidebar>
  </div>
</template>

<script>
  import NoteTag from './NoteTag.vue'

  export default {
    // Options / Data
    data () {
      return {
        sidebarButtonID: null,
        sidebarVisibility: false,
        selectedNote: null,
        selectedNoteNode: null,
      };
    },
    props: ['tags', 'notes', 'toggle'],
    methods: {
      switchNote: function(targetInput) {
        this.selectedNote = JSON.parse(targetInput.value);
        this.selectedNoteNode = targetInput.parentNode;
        if (this.toggle) {
          this.sidebarVisibility = false;
        }
        this.$emit('switchNote', this.selectedNote);
      },
      addNote: function () {
        if (this.toggle) {
          this.sidebarVisibility = false;
        }
        this.$emit('addnote');
      },
    },
    watch: {
      toggle: function () {
        this.sidebarVisibility = !this.toggle;
      },
    },
    // Options / Lifecycle Hooks
    components: {
      NoteTag,
    },
  }
</script>

<style scoped>
  .sidebar {
    height: space-between;
  }

  .v-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .v-button > span, .v-button > .icon {
    margin: 0 .25em;
  }

  .close {
    color: var(--light);
  }
</style>
