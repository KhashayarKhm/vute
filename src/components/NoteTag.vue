<template>
  <b-container>
    <b-col cols="12">
      <b-row>
        <b-button v-b-toggle="name" :pressed.sync="isOpen" :class="dyWaitClass" class="v-button" variant="outline-success">
          <span>{{ name }}</span>
          <b-icon-caret-down-fill class="icon" :class="{ r90: !isOpen, }"></b-icon-caret-down-fill>
        </b-button>
      </b-row>
      <b-row align-h="center">
        <b-collapse :id="name"  @show="wait" @hidden="wait" class="note-list-env">
          <b-container class="note-list-env">
            <b-col cols="12">
              <b-row v-for="note of notesObject" :key="note._id">
                <div class="radio" :id="note.subject" :class="checkedStyle(note.subject)">
                  <label>{{ note.subject }}</label>
                  <input type="radio" name="note-list" :value="JSON.stringify(note)" @input="$emit('checked', $event.target)" />
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
    // Options / Data
    data () {
      return {
        lazy: true,
        isOpen: false,
        dyWaitClass: undefined,
      };
    },
    props: { 'name': String, 'selectedNoteNode': HTMLElement, notesObject: Array, },
    methods: {
      checkedStyle: function(id) {
        const targetNode = document.querySelector(`#${id}`);
        return targetNode ? { checked: targetNode.isSameNode(this.selectedNoteNode), } : undefined;
      },
      uniqueId: function() {
        const newID = 'v-id-' + (Math.random() * 10000).toFixed();
        return newID;
      },
      wait: function() {
        this.dyWaitClass = this.isOpen ? 'wait' : undefined;
      },
    },
  }
</script>

<style scoped>
  .v-button {
    padding: 0 .5em;
    border: none;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition-duration: .35s;
    font-weight: bold;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .v-button > span {
    margin: 0 0 0 .5em;
  }

  .v-button:hover, .v-button:active {
    background-color: transparent;
    box-shadow: none;
  }

  .v-button:focus, .v-button.active {
    color: var(--light);
    box-shadow: none !important;
  }

  .v-button.wait {
    transition-delay: .35s;
  }

  .v-button.active:hover {
    background-color: var(--green);
  }

  .icon {
    width: .8em;
    height: .8em;
    transition: .35s;
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
    transition: .3s;
    border-top: .1em solid var(--dark);
  }

  .collapse .row:last-child > .radio {
    border-radius: 0 0 .25rem .25rem;
  }

  .radio:hover, .radio.checked {
    background-color: #12A581;
  }

  .radio > input[type = "radio"] {
    width: 100%;
    height: 2em;
    opacity: 0;
    position: absolute;
    left: 0;
  }

  .radio > label {
    margin: .5em 1em;
  }
</style>
