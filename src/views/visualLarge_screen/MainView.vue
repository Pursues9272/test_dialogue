<template>
    <div class="mainView-box">
      <header class="box-header">
        <div class="survey-title" v-for="item in 4">{{ item }}</div>
      </header>
    </div>
  </template>
  
  <script setup lang="ts"></script>
  
  <style scoped lang="less">
  .mainView-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: #f3f3f3;
    padding: 20px;
    .box-header {
      width: 100%;
      height: 200px;
      background-color: rgba(127, 255, 212, 0.2);
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-around;
    }
  }
  </style>
  