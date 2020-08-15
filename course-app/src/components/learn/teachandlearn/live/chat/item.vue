<template>
  <div :class="{ 'chat-item': true, 'chat-item-me': me }">
    <div :class="{ 'chat-avatar': !me, 'chat-avatar-me': me }">
      <el-avatar size="small" :src="avatar"></el-avatar>
    </div>
    <div>
      <div :class="{ 'chat-nickname': true, 'chat-nickname-me': me }">
        {{ nickname }}
      </div>
      <pre class="chat-content">{{ content }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    avatar: String,
    nickname: String,
    content: String,
    me: Boolean
  }
}
</script>

<style>
.chat-item {
  display: flex;
  margin-bottom: 15px;
}
.chat-item-me {
  flex-direction: row-reverse;
}
.chat-avatar {
  margin-right: 8px;
}
.chat-avatar-me {
  margin-left: 8px;
}
.chat-nickname {
  font-size: 12px;
  color: #7d7d7d;
}
.chat-nickname-me {
  text-align: right;
}
.chat-content {
  margin-top: 4px;
  padding: 8px 13px;
  background: #efefef;
  border-radius: 8px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
