<template>
    <div>
        <div class="controls">
            <font-awesome-icon class="nodrag" @click="minimize" icon="minus" />
        </div>
        <div class="controls">
            <font-awesome-icon class="nodrag" @click="close" icon="times" />
        </div>
    </div>
</template>

<script>
const { remote } = require("electron");
let win = remote.getCurrentWindow();

export default {
  name: "win_controls",
  methods: {
    minimize() {
      win.minimize();
    },
    maximize() {
      win.maximize();
    },
    close() {
      win.close();
    }
  }
};
</script>

<style scoped>
.controls {
  margin: 0.5vw;
}
</style>
