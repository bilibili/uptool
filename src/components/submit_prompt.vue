<template>
    <div>
        no submit tabs. start a new one?
        <button @click="addTab">yes</button>
    </div>
</template>

<script>
import submit_page from '@/components/submit_page'
export default {
  name: "submit_prompt",
  methods: {
    addTab: function() {
      this.$store.commit("addTab", {
        router: this.$router,
        template: submit_page,
        ifRedirect: true
      });
    }
  },
  created() {
      if (this.$store.getters.getActiveTabs.length != 0) {
          this.$router.push('/submit/1')
      }
  }
};
</script>
