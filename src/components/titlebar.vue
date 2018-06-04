<template>
    <nav class="navbar is-fixed-top level is-paddingless is-marginless" style=" background:#FF709E; height:40px; color:white;-webkit-app-region:drag;">
        <!-- Left side -->
        <div class="level-left">
            <p class="level-item">
            </p>
            <div class="level-item">
                <figure class="image is-24x24">
                    <img :src="myInfo.face" class="avatar">
                </figure>
            </div>
            <p class="level-item">
                {{myInfo.uname}}
            </p>
            <p class="level-item"> | </p>
            <div class="level-item ">
                Placeholder
            </div>

        </div>

        <!-- Right side -->
        <div class="level-right">
            <p class="level-item">
                <font-awesome-icon icon="cog" />
            </p>
            <p class="level-item"> | </p>
            <p class="level-item">
                <font-awesome-icon icon="minus" />
            </p>
            <p class="level-item">
                <font-awesome-icon icon="times" />
            </p>
            <p class="level-item"> </p>
        </div>
    </nav>
</template>

<script>
export default {
  name: "titlebar",
  data() {
      return {
          preData: {},
          myInfo: {}
      }
  },
  created: function() {
      $.getJSON(
      "https://member.bilibili.com/x/web/archive/pre?langs=cn",
      json => {
        if (json.code == 0) {
          this.preData = json;
          this.myInfo = this.preData.data.myinfo
        }
      }
    );
  }
};
</script>

<style scoped>
.avatar {
    border-radius: 12px;
}
</style>
