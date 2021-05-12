<template lang="html">
  <div class="note bg-primary text-light jumbotron m-0" style="word-break: break-word;">
    <div class="option-env">
      <div class="option">
        <b-button class="d-flex border-0" variant="outline-light" @click="$emit('edit')">
          <b-icon-pencil class="icon" />
        </b-button>
        <b-button class="d-flex border-0" variant="outline-danger" @click="$emit('remove')">
          <b-icon-trash class="icon" />
        </b-button>
      </div>
      <div class="d-flex">
        <b-icon-tag class="icon" style="position: relative; top: .4em; margin-right: .1em;" />
        <h5 class="m-0 font-weight-bold">{{ note.tag }}</h5>
      </div>
    </div>
    <h1 class="display-4">{{ note.subject }}</h1>
    <transition name="view-line">
      <hr v-show="display" class="my-3 border-light">
    </transition>
    <transition name="view-text"
    enter-active-class="animate__animated animate__fadeInDown">
      <div v-html="note.content"></div>
    </transition>
  </div>
</template>

<script>
  export default {
    // Options / Data
    data () {
      return {};
    },
    props: ['display', 'note'],
  }
</script>

<style scoped>
  .note-env {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .note {
    width: 100%;
    height: 100%;
    padding: 1rem 2rem;
    overflow-y: scroll;
    position: absolute;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .note::-webkit-scrollbar {
    display: none;
  }

  .option-env {
    width: 100%;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    justify-content: space-between;
  }

  .option, .tag {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .option > .option-item {
    display: flex;
  }

  .option .icon {
    width: .8em;
    height: .8em;
  }

  .view-line-enter-active {
    animation: view-line 1.4s;
  }

  @keyframes view-line {
    0% {
      width: 0;
    }

    100% {
      width: 100%;
    }
  }
</style>
