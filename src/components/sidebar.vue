<template>
    <aside class="menu">
        <p class="menu-label">
            通用
        </p>
        <ul class="menu-list">
            <li> <router-link to="/submit">投稿</router-link> </li>
            <li><a @click="openManagementPage">稿件管理</a></li>
        </ul>
        <p class="menu-label">
            工具
        </p>
        <ul class="menu-list">
            <li> <router-link to="/placeholder">转码</router-link> </li>
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

