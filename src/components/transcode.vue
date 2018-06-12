<template>
    <div>
        <div class="level">
            <div class="level-item file has-name is-boxed is-4 is-medium">
                <label class="file-label">
                    <input class="file-input" type="file" name="resume" @change="updateFromFile($event)">
                    <span class="file-cta">
                        <span class="file-icon">
                            <font-awesome-icon icon="file-video" />
                        </span>
                        <span class="file-label">
                            要转换的视频
                        </span>
                    </span>
                    <span class="file-name is-fullwidth">
                        {{fromFileName}}
                    </span>
                </label>
            </div>
            <div class="level-item">
                <font-awesome-icon icon="arrow-right" />
            </div>
            <div class="level-item file has-name is-boxed is-4 is-medium">
                <label class="file-label">
                    <input class="file-input" type="file" name="resume" @change="updateToFolder($event)" webkitdirectory>
                    <span class="file-cta">
                        <span class="file-icon">
                            <font-awesome-icon icon="folder" />
                        </span>
                        <span class="file-label">
                            目标文件夹
                        </span>
                    </span>
                    <span class="file-name">
                        {{toFolder}}
                    </span>
                </label>
            </div>
        </div>
        <div class="level">
            <div class="level-item">
                <button id="start" class="button" @click="transcode">开始转码</button>
            </div>
        </div>
        <div class="level">
            <div class="level-item">
                <progress class="progress" :value="progress" max="100"></progress>
            </div>
        </div>
    </div>
</template>

<script>
var path = require("path");
var ffmpeg_static = require("ffmpeg-static");
var ffmpeg = require("fluent-ffmpeg");
// have to be replaced because of processes cannot be spawned inside asar bundle
// if in dev mode, nothing will be replaced
// see https://electronjs.org/docs/tutorial/application-packaging#executing-binaries-inside-asar-archive
ffmpeg.setFfmpegPath(
  ffmpeg_static.path.replace("app.asar", "app.asar.unpacked")
);
export default {
  name: "transcode",
  methods: {
    updateFromFile(event) {
      this.fromFilePath = event.target.files[0].path;
      this.fromFileName = event.target.files[0].name;
    },
    updateToFolder(event) {
      this.toFolder = event.target.files[0].path;
    },
    transcode() {
      ffmpeg(this.fromFilePath)
        .on("progress", (progress) => {
          this.progress=progress.percent;
        })
        .output(path.join(this.toFolder, "output.mp4"))
        .run();
    }
  },
  data() {
    return {
      fromFilePath: null,
      toFolder: null,
      fromFileName: null,
      progress: 0
    };
  }
};
</script>