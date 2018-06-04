<template>
    <aside class="menu">
        <ul class="menu-list">
            <li>
                <router-link to="/submit" active-class="active-link">
                    <font-awesome-icon icon="upload" />
                    投稿
                </router-link> </li>
            <li>
                <a @click="openManagementPage">
                    <font-awesome-icon icon="archive" />
                    稿件管理
                </a>
            </li>
            <li>
                <router-link to="/placeholder" active-class="active-link">
                    <font-awesome-icon icon="exchange-alt" />
                    转码
                </router-link>
            </li>
        </ul>
    </aside>
</template>

<script>
export default {
    methods: {
        openManagementPage: function () {
            require('electron').shell.openExternal('https://member.bilibili.com/v2#/upload-manager/article')
        }
    }
}
</script>

<style scoped>
    .active-link {
        background-color: white;
    }
</style>

