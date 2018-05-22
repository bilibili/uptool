<template>
    <div class="modal is-active" style="text-align:center;">
        <div class="modal-background"></div>
        <div class="modal-card" style="display: inline-block; width: auto;">
            <header class="modal-card-head">
                <p class="modal-card-title">设置封面</p>
                <button v-on:click="$emit('close-modal')" class="delete" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <!-- Content ... -->
                <input id="cover-input" v-on:change="load" type='file'>
                <img id="cropper" :src="image_base64" style="max-width: 100%; max-height: calc(100vh - 300px);">
            </section>
            <footer class="modal-card-foot">
                <button v-on:click="save" class="button is-success">保存</button>
                <button v-on:click="reset" class="button">重置</button>
            </footer>
        </div>
    </div>
</template>
<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: "crop-modal",
  methods: {
    load: function(ev) {
      const files = ev.target.files;

      if (files && files[0]) {
        const reader = new FileReader();

        reader.onload = e => {
          this.image_base64 = e.target.result;
          var image = document.getElementById("cropper");
        };
        reader.readAsDataURL(files[0]);

        reader.onloadend = () => {
          if (this.cropper) {
            this.cropper.destroy();
          }
          this.initialize_cropper();
        };
      }
    },
    save: function() {
      this.$emit("set-cover", this.image_base64);
      this.$emit("close-modal");
      if (this.cropper.getCroppedCanvas()) {
        this.$emit(
          "cropped-cover",
          this.cropper.getCroppedCanvas().toDataURL()
        );
        this.$emit("cropper-data", this.cropper.getData());
      } else {
        this.$emit("cropped-cover", "");
        this.$emit("cropper-data", null);
      }
    },
    reset: function() {
      this.image_base64 = "";
      this.cropper.destroy();
      document.getElementById("cover-input").value = "";
      this.$emit("set-cover", this.image_base64);
    },
    initialize_cropper: function() {
      var image = document.getElementById("cropper");
      this.cropper = new Cropper(image, {
        viewMode: 0,
        aspectRatio: 16 / 10
      });
    }
  },
  props: ["src", "cropper_data"],
  data() {
    return {
      image_base64: this.src,
      image_cropped_base64: this.src,
      cropper: null
    };
  },
  mounted: function() {
    var image = document.getElementById("cropper");
    this.cropper = new Cropper(image, {
      viewMode: 0,
      aspectRatio: 16 / 10,
      data: this.cropper_data
    });
  }
};
</script>
