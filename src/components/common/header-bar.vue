<template>
  <div class="header-wrap">
    <div class="header">
      <h1 class="title">My Resume</h1>
    </div>
    <p class="disclaimer">声明：本页面展示的简历信息均为虚构示例，仅用于样式与功能演示。</p>
  </div>
</template>

<style scoped>
.header-wrap {
  width: 100%;
  max-width: 920px;
  text-align: center;
}

.header {
  width: 100%;
  height: fit-content;
  color: #2f2a24;
  border-bottom: 1px solid #d6d0c4;
  margin-bottom: 8px;
  background-color: transparent;

  .title {
    margin: 0;
    padding: 10px 0 8px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
}

.disclaimer {
  margin: 0 0 10px;
  font-size: 12px;
  color: #6f675b;
}
</style>
