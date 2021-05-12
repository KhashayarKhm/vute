<template>
  <div id="app">
    <b-container class="h-100" fluid>
      <b-row :align-h="mobileScreenMatches ? 'around' : 'end'" align-v="center" cols="12" style="height: 3em;">
        <b-button v-b-toggle.note-list v-if="mobileScreenMatches" variant="outline-primary" class="border-0">
          <b-icon-file-text />
        </b-button>
        <h1 class="m-0 h3" :class="{ 'mx-5': !mobileScreenMatches, }"><strong>V-Note</strong></h1>
      </b-row>
      <b-row style="height: calc(100% - 3em); display: flex; justify-content: center;">
        <b-col lg="9" md="8" cols="12" order-md="2" class="h-100">
          <WorkEnvironment :tags="tags" :addNew="workEnvMode.addNew" :note="targetDisplayNote" @modify="modifyNote" @removeNote="removeNote" />
        </b-col>
        <b-col col lg="3" md="4" order-md="1" :style="{ height: mobileScreenMatches ? 0 : null, position: mobileScreenMatches ? 'absolute' : null, }">
          <Sidebar :toggle="mobileScreenMatches" :tags="tags" :notes="organizedNotes"
          @addnote="workEnvMode.addNew = true" @switchNote="targetDisplayNote = $event" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import ZangoDB from 'zangodb'
import WorkEnvironment from './components/WorkEnvironment.vue'
import Sidebar from './components/Sidebar.vue'

export default {
  name: 'App',
  components: {
    WorkEnvironment,
    Sidebar,
  },
  data: function() {
    return {
      workEnvMode: { addNew: false, },
      tags: [],
      organizedNotes: {},
      mobileScreenMatches: true,
      database: new ZangoDB.Db('v_note', { notes: ['subject', 'tag', 'content'], }),
      targetDisplayNote: null,
    };
  },
  methods: {
    getNotes: async function () {
      const notesOS = this.database.collection('notes');
      const allNotes = await notesOS.find().toArray();
      let noteObject;
      for (noteObject of allNotes) {
        if (!this.tags.includes(noteObject.tag)) {
          this.tags.push(noteObject.tag);
          this.organizedNotes[noteObject.tag] = [];
        }
        if (this.organizedNotes[noteObject.tag].findIndex(ono => ono.subject === noteObject.subject) === -1) {
          this.organizedNotes[noteObject.tag].push(noteObject);
        }
      }
    },
    modifyNote: async function (object) {
      if (!object) {
        this.workEnvMode.addNew = false;
        return;
      }
      const notesOS = this.database.collection('notes');
      if (this.workEnvMode.addNew) {
        notesOS.insert(object.modifiedNote);
        this.workEnvMode.addNew = false;
      } else {
        notesOS.update(object.previousNote, object.modifiedNote);
        this.organizedNotes[object.previousNote.tag] = this.organizedNotes[object.previousNote.tag].filter(ono => ono.subject !== object.previousNote.subject);
        this.targetDisplayNote.subject = object.modifiedNote.subject ?? this.targetDisplayNote.subject;
        this.targetDisplayNote.tag = object.modifiedNote.tag ?? this.targetDisplayNote.tag;
        this.targetDisplayNote.content = object.modifiedNote.content ?? this.targetDisplayNote.content;
      }
      this.getNotes();
    },
    removeNote: function (targetNote, previousNote) {
      const notesOS = this.database.collection('notes');
      notesOS.remove({ _id: targetNote._id, });
      this.organizedNotes[targetNote.tag] = this.organizedNotes[targetNote.tag].filter(note => note._id !== targetNote._id);
      this.tags = this.tags.filter(tag => tag !== targetNote.tag);
      if (!this.organizedNotes[targetNote.tag].length) {
        this.organizedNotes = Object.keys(this.organizedNotes).reduce((object, tagName) => {
          if (this.organizedNotes[tagName].length) {
            object[tagName] = this.organizedNotes[tagName];
          }
          return object;
        }, {});
      }
      this.targetDisplayNote = previousNote._id ? previousNote : null;
    },
  },
  mounted() {
    this.getNotes();
    this.mobileScreenMatches = window.matchMedia('(max-width: 768px)').matches;
    window.addEventListener('resize', () => this.mobileScreenMatches = window.matchMedia('(max-width: 768px)').matches);
  },
}
</script>

<style>
  @font-face {
    font-family: "Markazi";
    src: url("./assets/Markazi.ttf");
  }

  html {
    font-size: 18px;
    line-height: 18px;
    width: 100vw;
    height: 100vh;
  }

  body {
    width: 100%;
    height: 100%;
  }

  #app {
    font-family: "Markazi";
    font-size: 1em;
    line-height: 1em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #16C79A;
    color: #F8F1F1;
    width: 100%;
    height: 100%;
  }

  /* This styles are for "EditNoteEnv" component */
  #app div.editor > form.add-form > div.editor__content > div.ProseMirror {
    padding: 0 .5rem 0 .3rem;
    border-left: .2em solid var(--red);
    overflow-y: scroll;
    height: 100%;
  }

  #app div.editor > form.add-form > div.editor__content > div.ProseMirror:focus-visible {
    outline: none;
    border-color: var(--green);
  }

  #app div.editor > form.add-form > div.editor__content > div.ProseMirror pre {
    background-color: var(--dark);
    color: var(--light);
    width: max-content;
    padding: .5rem;
    border-radius: .3rem;
    margin: 1rem 0;
    font-size: .8em;
  }

  #app div.editor > form.add-form > div.editor__content > div.ProseMirror blockquote {
    background-color: inherit;
    border-left: .2rem solid lightgrey;
    padding-left: .5rem;
  }

  #app div.editor > form.add-form > div.editor__content > div.ProseMirror > p.is-editor-empty:first-child::before {
    content: attr(data-empty-text);
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
    font-size: 1.3rem;
  }

  .dynamic-sidebar-width {
    width: 100% !important;
  }

  @media screen and (min-width: 576px) {
    .dynamic-sidebar-width {
      width: 325px !important;
    }
  }

  @media screen and (min-width: 768px) {
    .dynamic-sidebar-width {
      width: 33.333% !important;
    }
  }

  @media screen and (min-width: 992px) {
    .dynamic-sidebar-width {
      width: 25% !important;
    }
  }
</style>
