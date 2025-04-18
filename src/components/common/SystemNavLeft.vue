<template>
  <div class="system-navLeft-box">
    <div class="navLeft-box-top" :class="isCollapse ? 'navLeft-boxShrink-top' : ''">
      <img src="@/assets/logon_image/loge.png" alt="home-leftNav-logo" />
      <div class="navLeft-title" v-show="!isCollapse">
        <span>望康宝</span>
        <span>WellBeing</span>
      </div>
    </div>
    <div class="navLeft-box-bottom">
      <el-menu
        class="el-menu-vertical-demo navLeft-menu"
        :collapse="isCollapse"
        text-color="#6E6E6E"
        active-text-color="#00bfff"
        router
      >
        <el-menu-item
          v-for="(item, index) in menuList"
          :key="index"
          :index="item.url"
          class="navLeft-item"
        >
          <el-icon><icon-menu /></el-icon>
          <template #title>{{ item.name }}</template>
        </el-menu-item>
      </el-menu>
      <div class="shrink-box" @click="shrikFun">
        <img v-show="isCollapse" src="@/assets/common_image/expand.png" alt="home-leftNav-expand" />
        <img
          v-show="!isCollapse"
          src="@/assets/common_image/contract.png"
          alt="home-leftNav-contract"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Menu as IconMenu } from '@element-plus/icons-vue'

// 收缩控制
const isCollapse = ref(false)

// 收缩功能
const shrikFun = () => {
  console.log('收缩')
  isCollapse.value = !isCollapse.value
}

let menuList = reactive([
  {
    ident: 1,
    url: '/first-page',
    name: '首页'
  },
  {
    ident: 2,
    url: '/detection-data',
    name: '检测数据'
  }
])
</script>

<style scoped lang="less">
.system-navLeft-box {
  width: 100%;
  height: 100vh;
  background: #fffaf1;
  width: fit-content;
  position: relative;
  .navLeft-box-top {
    width: fit-content;
    height: 105px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    box-sizing: border-box;
    padding: 0 30px;
    margin-bottom: 10px;
    img[alt='home-leftNav-logo'] {
      width: 75px;
      height: 62px;
      margin-right: 15px;
    }
    .navLeft-title {
      width: fit-content;
      height: 100%;
      color: #ef5609;
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      span:first-child {
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 0.09em;
      }
      span:last-child {
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0.09em;
      }
    }
  }
  .navLeft-boxShrink-top {
    width: fit-content;
    padding: 0 27.5px;
    img[alt='home-leftNav-logo'] {
      width: 50px;
      height: 42px;
      margin-right: 0;
    }
  }
  .navLeft-box-bottom {
    width: 100%;
    height: fit-content;
    max-height: calc(100% - 105px);
    box-sizing: border-box;
    // background-color: #ef5609;
    .navLeft-menu {
      background-color: #fffaf1;
      // width: 100%;
      height: fit-content;
      min-width: 105px;
      max-height: calc(100% - 105px);
      .navLeft-item {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        padding: 0 30px;
        ::v-deep .el-menu-tooltip__trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      }
      .el-menu-item.is-active {
        color: #fff;
        background-color: #ff9f50;
      }
    }
    .shrink-box {
      position: absolute;
      // background-color: #ef5609;
      width: 21px;
      height: fit-content;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
