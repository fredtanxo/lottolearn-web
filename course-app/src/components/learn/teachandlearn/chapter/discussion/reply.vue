<template>
  <div
    v-loading="repliesLoading"
    class="discussion-replies">
    <el-form
      ref="replyForm"
      :model="replyForm">
      <el-form-item
        prop="content"
        :rules="[
          { required: true, message: ' ', trigger: 'change' }
        ]">
        <el-input
          ref="replyInputRef"
          type="textarea"
          :autosize="{ minRows: 1 }"
          :disabled="posting"
          clearable
          placeholder="请输入回复内容"
          v-model="replyForm.content"
          style="display: inline-block; width: calc(100% - 50px);">
        </el-input>
        <el-button
          type="primary"
          size="small"
          circle
          icon="el-icon-s-promotion"
          :loading="posting"
          @click="handlePostReply"
          style="margin-left: 15px;">
        </el-button>
      </el-form-item>
    </el-form>
    <div
      v-for="(reply, index) in replies"
      :key="reply.id"
      class="discussion-reply-item">
      <div class="discussion-avatar">
        <el-avatar :src="reply.userAvatar" :size="32"></el-avatar>
      </div>
      <div class="discussion-details">
        <div class="discussion-meta">
          <span>{{ reply.userNickname }}</span>
          &emsp;
          <span>{{ reply.pubDate }}</span>
          &emsp;
          <span>{{ `#${total - index}` }}</span>
        </div>
        <div class="discussion-content">
          <p>{{ reply.content }}</p>
        </div>
        <div class="discussion-actions">
          <el-button
            type="text"
            class="discussion-action"
            @click="handleLikeReply(reply)">
            <i class="el-icon-arrow-up"></i>
            <span>{{ reply.votes }}</span>
          </el-button>
          &emsp;
          <el-button
            type="text"
            class="discussion-action"
            @click="handleReplyReply(reply, total - index)">
            <i class="el-icon-chat-line-square"></i>
            <span>回复</span>
          </el-button>
        </div>
      </div>
    </div>
    <div style="text-align: center;">
      <el-link
        v-if="total !== replies.length"
        type="primary"
        :disabled="repliesLoading"
        @click="handleMoreReplies">
        {{ repliesLoading ? '加载中' : '更多' }}
      </el-link>
      <el-link
        v-else
        type="primary"
        disabled>
        已全部加载
      </el-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import {
  findChapterDiscussionReplies,
  postChapterDiscussion,
  likeChapterDiscussion
} from '@/api/learn'

export default {
  props: {
    discussion: Object
  },
  data() {
    return {
      chapterId: this.$route.params.chapterId,
      repliesLoading: true,
      posting: false,
      total: 0,
      replies: [],
      replyForm: {
        content: '',
        replyNickname: '',
        replyTo: null
      },
      query: {
        page: 0,
        size: 5,
        courseId: this.$route.params.courseId
      }
    }
  },
  computed: mapState(['user']),
  methods: {
    refreshReplies() {
      findChapterDiscussionReplies(this.discussion.id, this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.replies = data.payload.data
        })
        .finally(() => this.repliesLoading = false)
    },
    handleMoreReplies() {
      this.repliesLoading = true
      this.query.page++
      findChapterDiscussionReplies(this.discussion.id, this.query)
        .then(response => {
          const data = response.data
          this.replies.push(...data.payload.data)
        })
        .finally(() => this.repliesLoading = false)
    },
    handlePostReply() {
      this.$refs.replyForm.validate(valid => {
        if (valid) {
          this.posting = true
          postChapterDiscussion(this.query.courseId, this.chapterId, this.replyForm)
            .then(response => {
              this.$refs.replyForm.resetFields()
              this.replyForm.content = `@${this.replyForm.replyNickname}: `
              const data = response.data
              this.replies.unshift({
                ...data.payload,
                userNickname: this.user.nickname,
                userAvatar: this.user.avatar
              })
              this.total++
              this.discussion.replies = this.total
            })
            .catch(() => this.$message.error('发布失败'))
            .finally(() => {
              this.posting = false
              this.$nextTick(() => this.$refs.replyInputRef.focus())
            })
        }
      })
    },
    handleLikeReply(reply) {
      likeChapterDiscussion(reply.id, this.query.courseId)
        .then(() => reply.votes++)
    },
    handleReplyReply(reply, index) {
      this.replyForm.replyNickname = reply.userNickname
      if (this.replyForm.content) {
        this.replyForm.content = this.replyForm.content.replace(/^@.*?:\s/, `@${reply.userNickname} #${index}: `)
      } else {
        this.replyForm.content = `@${this.discussion.userNickname} #${index}: `
      }
      this.$refs.replyInputRef.focus()
    }
  },
  mounted() {
    this.replyForm.replyTo = this.discussion.id
    this.replyForm.replyNickname = this.discussion.userNickname
    this.replyForm.content = `@${this.discussion.userNickname}: `
    this.$refs.replyInputRef.focus()

    this.refreshReplies()
  }
}
</script>

<style>
@import './item.css';

.discussion-replies {
  background: #f5f7fa;
  margin: 10px 0;
  padding: 15px 20px;
  border-radius: 4px;
  transition: .3s;
}
.discussion-replies:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}
.discussion-reply-item {
  display: flex;
  margin: 15px 0;
}
</style>
