<template lang="html">
  <div class="work-env">
    <b-modal id="make-sure-alert" body-bg-variant="primary" body-text-variant="light"
    centered hide-header hide-footer v-model="makeSureAlertVisibility">
      <p>Are you sure to remove this note?</p>
      <div class="d-flex align-content-center justify-content-center">
        <b-button size="sm" variant="danger" class="mx-1 w-25" @click="removeNote">Remove</b-button>
        <b-button size="sm" variant="outline-light" class="mx-1 w-25"
        @click="makeSureAlertVisibility = false">Cancel</b-button>
      </div>
    </b-modal>
    <transition
    enter-active-class="animate__animated animate__zoomIn"
    leave-active-class="animate__animated animate__zoomOut">
      <div v-show="!addNew && !editMode" class="sub-env">
        <transition enter-active-class="animate__animated animate__backInDown">
          <Note v-show="note && !switchNote" :display="!editMode" :note="currentNote" @edit="editNote" @remove="makeSureAlertVisibility = true" />
        </transition>
        <transition leave-active-class="animate__animated animate__backOutDown">
          <Note v-show="note && switchNote" :display="!editMode" :note="previousNote" />
        </transition>
        <transition
        enter-active-class="animate__animated animate__backInDown"
        leave-active-class="animate__animated animate__backOutDown">
          <div v-if="!note" class="no-choose">
            <h1 style="display: flex; align-items: center;">
              No note choose to display
              <b-icon-exclamation-triangle />
            </h1>
          </div>
        </transition>
      </div>
    </transition>
    <transition
    enter-active-class="animate__animated animate__fadeInLeft"
    leave-active-class="animate__animated animate__fadeOutLeft">
      <div v-show="addNew || editMode" class="sub-env">
        <EditNoteEnv :tags="tags" :note="targetEditingNote" @exit="exitFromEditor($event)" />
      </div>
    </transition>
  </div>
</template>

<script>
  import Note from './Note.vue'
  import EditNoteEnv from './EditNoteEnv.vue'

  export default {
    // Options / Data
    data () {
      return {
        switchNote: false,
        editMode: false,
        previousNote: { subject: '', tag: '', content: '', },
        targetEditingNote: { subject: '', tag: '', content: '', },
        makeSureAlertVisibility: false,
      };
    },
    props: {
    'tags': Array,
    'note': Object,
    'addNew': Boolean,
   },
    computed: {
      currentNote: function () {
        return this.note || { subject: '', tag: '', content: '', };
      },
      noteSubject: function () {
        return this.note ? this.note.subject : '';
      },
    },
    methods: {
      log: function (arg1) {
        console.log(arg1);
      },
      editNote: function () {
        this.targetEditingNote = this.currentNote;
        this.editMode = true;
      },
      exitFromEditor: function (modifiedNote) {
        this.targetEditingNote = { subject: '', tag: '', content: '', };
        this.editMode = false;
        this.$emit('modify',
        modifiedNote ? { previousNote: this.currentNote, modifiedNote: modifiedNote, } : null);
      },
      removeNote: function () {
        this.makeSureAlertVisibility = false;
        this.$emit('removeNote', this.currentNote, this.previousNote);
      },
    },
    watch: {
      note: function (currentObject, previousObject) {
        if (previousObject) {
          this.previousNote = previousObject;
          this.switchNote = true;
          setTimeout(() => this.switchNote = false);
        } else {
          this.switchNote = false;
        }
      },
    },
    // Options / Lifecycle Hooks
    components: {
      Note,
      EditNoteEnv,
    },
  }
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
