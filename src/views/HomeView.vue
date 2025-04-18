<template>
  <div class="indexHome-box">
    <main class="indexHome-box-right">
      <div class="indexHome-box-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="less">
.indexHome-box {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-flow: row nowrap;
  background-color: #f3f3f3;
  .indexHome-box-left {
    width: fit-content;
    height: 100%;
  }
  .indexHome-box-right {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    .indexHome-box-title {
      width: 100%;
      height: fit-content;
    }
    .indexHome-box-main {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
