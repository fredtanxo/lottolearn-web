<template>
  <div class="add-result">
    <i
      class="el-icon-success"
      style="color: #67C23A; font-size: 3em;"
      v-if="result.success">
    </i>
    <i
      class="el-icon-error"
      style="color: #F56C6C; font-size: 3em;"
      v-else>
    </i>
    <div class="add-info">
      {{ result.message }}
      <div v-if="mode === 'add'">
        课程邀请码：
        <span
          ref="addCodeRef"
          class="add-code">
          {{ result.invitationCode }}
        </span>
      </div>
      <div v-if="result.success">
        <el-link
          type="primary"
          @click="callback(`/learn/${result.courseId}`)">
          进入课堂
        </el-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    result: Object,
    mode: String,
    callback: Function
  }
}
</script>

<style scoped>
.add-result {
  text-align: center;
  font-size: 2em;
  line-height: 2;
}
.add-info {
  margin: 15px 0;
}
</style>
