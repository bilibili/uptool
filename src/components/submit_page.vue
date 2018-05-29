<template>
  <div id="submit">
    <div class="box" id="control">
      <nav class="level">
        <div class="level-left">
          <span id="selectfiles" class="button webuploader-container">新建投稿</span>
          &nbsp;
          <button id="start" v-show='is_paused && is_uploading' v-on:click="ybup.start(); is_paused=false" class="button is-light"> 继续上传 </button>
          <button id="stop" :disabled='!is_uploading' v-show='!is_paused' v-on:click="ybup.stop(); is_paused=true" class="button is-light"> 暂停上传 </button>
        </div>
        <div class="level-right">
          <button class="button" v-on:click="showModal=true">封面</button>
          &nbsp;
          <button v-on:click="submit" class="button is-dark">提交</button>
        </div>
      </nav>
    </div>

    <crop-modal v-if="showModal" @set-cover="image_base64=$event" :src="image_base64" @close-modal="showModal = false" @cropped-cover="cropped_cover=$event" @cropper-data="cropper_data=$event" :cropper_data="cropper_data"></crop-modal>

    <div class="box" id="content">
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
        <progress class="progress" max="100" :value=video.percent></progress>
      </div>
      <br>

      <form id="form">

        <div class="field">
          <label class="label">稿件标题</label>
          <div class="control">
            <input name="title" class="input" type="text" placeholder="Text input">
          </div>
        </div>

        <div class="field">
          <label class="label">标签(逗号分隔)</label>
          <div class="control">
            <input name="tag" class="input" type="text" placeholder="如：动作,MAD">
          </div>
        </div>

        <div class="field">
          <label class="label">视频简介</label>
          <div class="control">
            <textarea class="textarea" name="desc" type="text" placeholder="请输入简介"></textarea>
          </div>
        </div>

        <label class="label">类型</label>
        <div class="field">
          <div class="control">
            <label class="radio">
              <input name="copyright" value="1" type="radio"> 自制
            </label>
            <label class="radio">
              <input name="copyright" value="2" type="radio"> 转载
            </label>
          </div>
          <div class="control">
            <div class="select is-rounded">
              <select name="tid">
                <option v-for="category in categories" :value="category.id">{{category.name}}</option>
              </select>
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import crop_modal from "./crop_modal.vue";
import { ybuploader } from "../js/ybuploader.full";

export default {
  name: "submit_page",
  components: {
    "crop-modal": crop_modal
  },
  data() {
    return {
      ybup: {},
      videos: [],
      categories: [
        { id: "24", name: "动画-MAD·AMV" },
        { id: "25", name: "动画-MMD·3D" },
        { id: "47", name: "动画-短片·手书·配音" },
        { id: "27", name: "动画-综合" },
        { id: "33", name: "番剧-连载动画" },
        { id: "32", name: "番剧-完结动画" },
        { id: "153", name: "番剧-国产动画" },
        { id: "51", name: "番剧-资讯" },
        { id: "152", name: "番剧-官方延伸" },
        { id: "153", name: "国创-国产动画" },
        { id: "168", name: "国创-国产原创相关" },
        { id: "169", name: "国创-布袋戏" },
        { id: "170", name: "国创-资讯" },
        { id: "28", name: "音乐-原创音乐" },
        { id: "31", name: "音乐-翻唱" },
        { id: "30", name: "音乐-VOCALOID·UTAU" },
        { id: "59", name: "音乐-演奏" },
        { id: "29", name: "音乐-三次元音乐" },
        { id: "54", name: "音乐-OP/ED/OST" },
        { id: "130", name: "音乐-音乐选集" },
        { id: "20", name: "舞蹈-宅舞" },
        { id: "154", name: "舞蹈-三次元舞蹈" },
        { id: "156", name: "舞蹈-舞蹈教程" },
        { id: "17", name: "游戏-单机联机" },
        { id: "65", name: "游戏-网游·电竞" },
        { id: "136", name: "游戏-音游" },
        { id: "19", name: "游戏-Mugen" },
        { id: "121", name: "游戏-GMV" },
        { id: "37", name: "科技-纪录片" },
        { id: "124", name: "科技-趣味科普人文" },
        { id: "122", name: "科技-野生技术协会" },
        { id: "39", name: "科技-演讲• 公开课" },
        { id: "96", name: "科技-星海" },
        { id: "95", name: "科技-数码" },
        { id: "98", name: "科技-机械" },
        { id: "71", name: "娱乐-综艺" },
        { id: "137", name: "娱乐-明星" },
        { id: "131", name: "娱乐-Korea相关" },
        { id: "22", name: "鬼畜-鬼畜调教" },
        { id: "26", name: "鬼畜-音MAD" },
        { id: "126", name: "鬼畜-人力VOCALOID" },
        { id: "127", name: "鬼畜-教程演示" },
        { id: "82", name: "电影-电影相关" },
        { id: "85", name: "电影-短片" },
        { id: "145", name: "电影-欧美电影" },
        { id: "146", name: "电影-日本电影" },
        { id: "147", name: "电影-国产电影" },
        { id: "83", name: "电影-其他国家" },
        { id: "15", name: "电视剧-连载剧集" },
        { id: "34", name: "电视剧-完结剧集" },
        { id: "128", name: "电视剧-电视剧相关" },
        { id: "86", name: "电视剧-特摄·布袋" },
        { id: "157", name: "时尚-美妆" },
        { id: "158", name: "时尚-服饰" },
        { id: "164", name: "时尚-健身" },
        { id: "159", name: "时尚-资讯" },
        { id: "138", name: "生活-搞笑" },
        { id: "21", name: "生活-日常" },
        { id: "76", name: "生活-美食圈" },
        { id: "75", name: "生活-动物圈" },
        { id: "161", name: "生活-手工" },
        { id: "162", name: "生活-绘画" },
        { id: "163", name: "生活-运动" },
        { id: "166", name: "广告-广告" }
      ],
      is_paused: false,
      is_uploading: false,
      showModal: false,
      image_base64: "",
      cropped_cover: "",
      cropper_data: null
    };
  },
  methods: {
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

      var formData = $("form").serializeArray();
      var req = { videos: videos };
      formData.forEach(function(obj) {
        if (["copyright", "tid"].indexOf(obj.name) >= 0) {
          req[obj.name] = parseInt(obj.value);
        } else {
          req[obj.name] = obj.value;
        }
      });

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
        $("#" + fileid).remove();
        file.destroy();
        file.uploaded = false;

        var index = videos.indexOf(file);
        if (index >= 0) {
          videos.splice(index, 1);
        }
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
              success: function(result) {
                console.log(result);
                if (result.code == 0) {
                  // if (confirm('成功！前往稿件管理？(需等待大概1分钟才会有)')) {
                  //     openNewTab("http://member.bilibili.com/v/#!/article");
                  // }
                  // setTimeout(function () { window.location = window.location }, 500);
                  var notif = new Notification("上传成功！");
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
      });

      this.ybup.bind("FileUploaded", (up, file, info) => {
        file.uploaded = true;
        file.status = "complete";
        // $('#' + file.id + '>.state').html('上传成功');
        // if ($('#auto_submit').is(':checked')) {
        //     $("form").submit();
        // }
        new Notification("上传成功", { body: file.name });
        this.is_uploading = false;
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
#control {
  position: sticky;
  top: 0;
  margin-top: 0;
  z-index: 1;
}

#selectfiles {
  cursor: default;
  border: 0;
}

.video-name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
