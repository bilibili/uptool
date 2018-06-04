<template>
  <div id="submit">
    <div id="control">
      <nav class="level">
        <div class="level-left">
          <span id="selectfiles" class="button webuploader-container">
            <font-awesome-icon icon="plus" /> 新建投稿
          </span>
          &nbsp;
          <button id="start" v-show='is_paused && is_uploading' v-on:click="ybup.start(); is_paused=false" class="button is-light"> 继续上传 </button>
          <button id="stop" :disabled='!is_uploading' v-show='!is_paused' v-on:click="ybup.stop(); is_paused=true" class="button is-light"> 暂停上传 </button>
        </div>
        <div class="level-right">
          <button class="button" v-on:click="showModal=true">
            设置封面
          </button>
          &nbsp;
          <button v-on:click="submit" class="button submit-button">提交</button>
        </div>
      </nav>
    </div>

    <crop-modal v-if="showModal" @set-cover="image_base64=$event" :src="image_base64" @close-modal="showModal = false" @cropped-cover="cropped_cover=$event" @cropper-data="cropper_data=$event" :cropper_data="cropper_data">
    </crop-modal>

    <div id="content" @click="clicked=undefined">
      <div id="filelist" v-for="video in videos">
        <div class="columns">
          <div class="column">
            <font-awesome-icon v-show="video.status=='progress'" icon="upload" />
            <font-awesome-icon v-show="video.status=='error'" icon="exclamation-triangle" />
            <font-awesome-icon v-show="video.status=='complete'" icon="check-circle" />
          </div>
          <div class="column is-5">
            <p class="video-name">{{video.name}}</p>
          </div>
          <div class="column is-5">
            <span v-show="video.status=='progress'">正在上传</span>
            <span v-show="video.status=='error'">错误</span>
            <span v-show="video.status=='complete'">完成</span>
          </div>
          <div class="column">
            <a v-on:click="cancel(video.id, videos)">
              <font-awesome-icon icon="trash-alt" />
            </a>
          </div>
        </div>
        <progress class="progress is-small" max="100" :value=video.percent></progress>
        <br>
      </div>
      <br>

      <div id="form">
        <label class="label">投稿类型</label>
        <div class="field">
          <div class="control">
            <label class="radio">
              <input name="copyright" value="1" type="radio" v-model="formData.copyright"> 自制
            </label>
            <label class="radio">
              <input name="copyright" value="2" type="radio" v-model="formData.copyright"> 转载
            </label>
          </div>
          <br>
          <!-- <div class="control">
            <div class="select is-rounded">
              <select name="tid" v-model="formData.tid">
                <option v-for="category in categories" :value="category.id">{{category.name}}</option>
              </select>
            </div>
          </div> -->
          <div v-for="halftype in halftypelist" class="columns is-gapless">
            <div v-for="videotype in halftype" class="column">
              <div class="dropdown" @click.stop="clicked=(clicked == videotype.id)? undefined : videotype.id" :class="{'is-active':videotype.id == clicked}">
                <div class="dropdown-trigger">
                  <button class="button is-rounded is-small dropdown-button" aria-haspopup="true" :aria-controls="videotype.id" :class="{'is-danger': videotype.id == highlighted.parent}">
                    {{videotype.name}}
                  </button>
                </div>
                <div class="dropdown-menu" :id="videotype.id" role="menu">
                  <div class="dropdown-content">
                    <a v-for="subtype in videotype.children" class="dropdown-item" @click="highlighted.parent=subtype.parent; highlighted.child=subtype.id; formData.tid=subtype.id" :class="{'selected-dropdown': highlighted.child == subtype.id}">
                      {{subtype.name}}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        <div class="field">
          <label class="label">稿件标题</label>
          {{formData.title}}
          <div class="control">
            <input-counter placeholder="稿件标题" v-model="formData.title" name="title" class="input" type="text" maxlength="80"></input-counter>
          </div>
        </div>

        <div class="field">
          <label class="label">标签</label>
          <!-- <div class="control">
            <input name="tag" class="input" type="text" placeholder="动作,MAD" v-model="formData.tag">
          </div> -->
          <div class="control">
            <!-- tag cloud -->
            <div class="tags">
              <span class="tag" v-for="tag in formData.tags">
                {{tag}}
                <button class="delete is-small" @click="removeTag(tag)"></button>
              </span>
            </div>
            <span class="is-size-7 has-text-grey">还可添加 {{10 - formData.tags.length}} 个标签</span>
            <span class="is-size-7 has-text-grey">{{tagErrorMessage}}</span>
            <input-counter maxlength="20" name="tag" class="input" type="text" placeholder="回车添加" v-model="tagInput" @enter="addTag">
            </input-counter>
          </div>
        </div>

        <div class="field">
          <label class="label">视频简介</label>
          <div class="control">
            <textarea class="textarea" name="desc" type="text" placeholder="请输入简介" v-model="formData.desc"></textarea>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import crop_modal from "./crop_modal.vue";
import input_counter from "./input_counter";
import { ybuploader } from "../js/ybuploader.full";
const { ipcRenderer, remote } = require("electron");

export default {
  name: "submit_page",
  components: {
    "crop-modal": crop_modal,
    "input-counter": input_counter
  },
  data() {
    return {
      tagErrorMessage: "",
      tagInput: "",
      highlighted: {
        parent: undefined,
        child: undefined
      },
      clicked: undefined,
      preData: {},
      typelist: [],
      formData: {
        tags: [],
        title: ""
      },
      ybup: {},
      videos: [],
      is_paused: false,
      is_uploading: false,
      showModal: false,
      image_base64: "",
      cropped_cover: "",
      cropper_data: null
    };
  },
  computed: {
    halftypelist: function() {
      if (this.typelist) {
        var mid = Math.ceil(this.typelist.length / 2);
        return [this.typelist.slice(0, mid), this.typelist.slice(mid)];
      } else {
        return [[], []];
      }
    }
  },
  methods: {
    addTag: function() {
      if (this.tagInput) {
        if (this.formData.tags.includes(this.tagInput)) {
          this.tagErrorMessage = "标签已存在";
        } else if (this.formData.tags.length >= 10) {
          this.tagErrorMessage = "标签太多了";
        } else {
          this.formData.tags.push(this.tagInput);
          this.tagInput = "";
          this.tagErrorMessage = "";
        }
      }
    },
    removeTag: function(tag) {
      var index = this.formData.tags.indexOf(tag);
      if (index >= 0) {
        this.formData.tags.splice(index, 1);
      }
    },
    submit: function() {
      var videos = [];
      for (var i = 0; i < this.videos.length; i++) {
        var file = this.videos[i];
        if (!file.uploaded) {
          var notif = new Notification("有正在进行的上传，请等待完成或取消");
          return false;
        } else {
          videos.push({
            desc: "",
            filename: file.bili_filename,
            title: file.name.substring(0, file.name.lastIndexOf("."))
          });
        }
      }

      // var formData = $("form").serializeArray();
      var req = { videos };
      // this.formData.forEach(function(obj) {
      for (const [key, value] of Object.entries(this.formData)) {
        if (["copyright", "tid"].indexOf(key) >= 0) {
          req[key] = parseInt(value);
        } else if (key == "tags") {
          req["tag"] = value.toString();
        } else {
          req[key] = value;
        }
      }

      if (videos.length == 0) {
        var notif = new Notification("请至少添加一个视频");
        return false;
      }

      if (!req.title) {
        var notif = new Notification("稿件标题不能为空");
        return false;
      }

      if (!req.tag) {
        var notif = new Notification("标签不能为空");
        return false;
      }

      req.tag = req.tag.replace(/，/g, ",");

      if (!req.desc) {
        var notif = new Notification("视频简介不能为空");
        return false;
      }

      if (!req.copyright) {
        var notif = new Notification("自制/转载不能为空");
        return false;
      }

      if (!req.tid) {
        var notif = new Notification("分区必须选择");
        return false;
      }

      if (
        videos.length > 1 &&
        0 <= ["145", "146", "147", "83"].indexOf(req.tid)
      ) {
        var notif = new Notification(
          "这四个分区只能提交单个视频：欧美电影，日本电影，国产电影，其它国家"
        );
        return false;
      }

      if (!this.cropped_cover && !confirm("没有设置封面，是否继续？")) {
        return false;
      }

      if (this.cropped_cover) {
        return this.submit_cover_and_video(req);
      } else {
        return this.submit_video(req);
      }
    },
    cancel: function(fileid, videos) {
      console.log(videos);
      if (confirm("确认取消上传？")) {
        var file = this.ybup.getFile(fileid);
        this.ybup.removeFile(file);
        file.destroy();
        file.uploaded = false;

        var index = videos.indexOf(file);
        if (index >= 0) {
          videos.splice(index, 1);
        }
        this.evaluateVideoStatus();
      }
    },
    submit_cover_and_video: function(req) {
      const { session } = require("electron").remote;
      var csrf;
      session.defaultSession.cookies.get(
        { name: "bili_jct" },
        (error, cookies) => {
          csrf = cookies[0]["value"];
          $.ajax({
            type: "POST",
            url: "https://member.bilibili.com/x/vu/web/cover/up",
            contentType: "application/x-www-form-urlencoded",
            data: {
              cover: this.cropped_cover,
              csrf
            },
            dataType: "json",
            success: result => {
              console.log(result);
              if (result.code == 0) {
                // perform ajax submit
                var cover_url = result["data"]["url"];
                req["cover"] = cover_url;
                return this.submit_video(req);
              } else {
                var notif = new Notification(result.message);
                return false;
              }
            }
          });
        }
      );
    },
    evaluateVideoStatus: function() {
      if (this.videos.length > 0) {
        ipcRenderer.send("hasVideoInQueue", true);
        for (var i = 0; i < this.videos.length; i++) {
          var file = this.videos[i];
          if (!file.uploaded) {
            ipcRenderer.send("isUploading", true);
            break;
          }
          if (i == this.videos.length - 1) {
            ipcRenderer.send("isUploading", false);
          }
        }
      } else {
        ipcRenderer.send("hasVideoInQueue", false);
        ipcRenderer.send("isUploading", false);
      }
    },
    submit_video: function(req) {
      const { session } = require("electron").remote;
      var csrf;
      session.defaultSession.cookies.get(
        { name: "bili_jct" },
        (error, cookies) => {
          csrf = cookies[0]["value"];
          if (csrf) {
            $.ajax({
              type: "POST",
              url: "https://member.bilibili.com/x/vu/web/add?csrf=" + csrf,
              contentType: "application/json; charset=utf-8",
              data: JSON.stringify(req),
              dataType: "json",
              success: result => {
                console.log(result);
                if (result.code == 0) {
                  // if (confirm('成功！前往稿件管理？(需等待大概1分钟才会有)')) {
                  //     openNewTab("http://member.bilibili.com/v/#!/article");
                  // }
                  // setTimeout(function () { window.location = window.location }, 500);
                  console.log("submit success");
                  var notif = new Notification("提交成功！");
                  console.log(this.formData);
                  // reset form
                  this.formData = Object.assign({}, { tags: [], title: "" });
                  this.clicked = undefined;
                  this.highlighted = Object.assign(
                    {},
                    { parent: undefined, child: undefined }
                  );

                  this.videos = [];
                  ipcRenderer.send("isUploading", false);
                  ipcRenderer.send("hasVideoInQueue", false);
                  return true;
                } else {
                  var notif = new Notification(result.message);
                  return false;
                }
              }
            });
          }
        }
      );
    }
  },
  created: function() {
    $.getJSON(
      "https://member.bilibili.com/x/web/archive/pre?langs=cn",
      json => {
        if (json.code == 0) {
          this.preData = json;
          this.typelist = json.data.typelist;
        }
      }
    );
    if (window.module) {
      module = window.module;
    }

    if (window.require) {
      require = window.require;
    }

    if (typeof module === "object") {
      window.module = module;
      module = undefined;
    }
    if (typeof require === "object") {
      window.require = require;
      require = undefined;
    }

    function getParam(key) {
      var vars = {};
      var parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
          vars[key] = value;
        }
      );
      return vars[key];
    }
    var os = getParam("os");

    $("#os").html(os);

    window.rec_rp =
      window.rec_rp ||
      function() {
        (rec_rp.q = rec_rp.q || []).push(arguments);
      };
    rec_rp("pageview");
    ybuploader.get_upcdns(upcdns => {
      console.log(upcdns);
      var upcdn = upcdns[0] || {};

      //
      // 更多参数详见
      // WebUploader API文档 - Web Uploader
      // http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_options
      //
      this.ybup = new ybuploader.Ybuploader(
        upcdn.os,
        {
          dnd: "#selectfiles",
          auto: false,
          pick: {
            id: "#selectfiles",
            multiple: true
          },
          accept: {
            mimeTypes:
              ".txt,.mp3,.mp4,.flv,.avi,.wmv,.mov,.webm,.mpeg4,.ts,.mpg,.rm,.rmvb,.mkv",
            title: "default"
          },
          chunkRetry: 10,
          chunkRetryDelay: 5000,
          duplicate: false,
          fileSingleSizeLimit: 4 * 1024 * 1024 * 1024 // '4GB'
          // browse_button: ['selectfiles'],
          // multi_selection: true,
          // runtimes: 'html5',
          // rename: true,
          // drop_element: '#selectfiles'
        },
        "ugcupos/yb",
        null,
        upcdn.query
      );

      this.ybup.bind("UploadProgress", (up, file) => {
        var speed = this.ybup.formatSize(up.total.bytesPerSec) + "/s - " + os;
        this.is_uploading = true;
      });

      this.ybup.bind("FileFiltered", (up, file) => {
        file.percent = 0;
        file.status = "";
        this.videos.push(file);
        ipcRenderer.send("isUploading", true);
        ipcRenderer.send("hasVideoInQueue", true);
        if (!this.formData.title) {
          this.formData.title = file.name;
        }
      });

      this.ybup.bind("FileUploaded", (up, file, info) => {
        file.uploaded = true;
        file.status = "complete";
        // $('#' + file.id + '>.state').html('上传成功');
        // if ($('#auto_submit').is(':checked')) {
        //     $("form").submit();
        // }
        var preferences = ipcRenderer.sendSync("getPreferences");
        var notifSetting = preferences.notification;
        var alertSetting = notifSetting.alert;
        if (notifSetting && alertSetting && alertSetting.includes("postUpload")) {
          new Notification("上传成功", { body: file.name });
        }
        this.is_uploading = false;
        this.evaluateVideoStatus();
      });

      this.ybup.bind("Error", function(up, err) {
        var notif = new Notification(err.showText);
      });

      this.ybup.bind("BeforeUpload", function(up, file) {
        console.log("BeforeUpload");
        console.log("bili_filename: " + file.bili_filename);
        console.log($("#" + file.id));
        console.log($("#" + file.id + ">.bili_filename"));
        $("#" + file.id + ">.bili_filename").html(file.bili_filename);
      });
      this.ybup.init();
    });
  }
};
</script>

<style>
.webuploader-container {
  position: relative;
}
.webuploader-element-invisible {
  position: absolute !important;
  clip: rect(1px, 1px, 1px, 1px);
}
.webuploader-pick {
  position: relative;
  display: inline-block;
  cursor: pointer;
  background: #00b7ee;
  padding: calc(0.375em - 1px) 0.75em calc(0.375em - 1px) 0.75em;
  color: #fff;
  text-align: center;
  border-radius: 3px;
  overflow: hidden;
}
.webuploader-pick-hover {
  background: #00a2d4;
}

.webuploader-pick-disable {
  opacity: 0.6;
  pointer-events: none;
}
</style>

<style scoped>
.submit-button {
  background-color: #ff709e;
  color: white;
}

.submit-button:hover {
  background-color: rgb(255, 164, 193);
  color: white;
}

.dropdown-button {
  width: 8vw;
}
#control {
  position: sticky;
  top: 0;
  margin-top: 0;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 0px 0px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  padding: 20px;
}

#selectfiles {
  cursor: default;
  border: 0;
  background-color: rgba(255, 255, 255, 0);
}

.video-name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.selected-dropdown {
  background-color: #cecece;
}

#content {
  padding: 20px;
}
</style>
