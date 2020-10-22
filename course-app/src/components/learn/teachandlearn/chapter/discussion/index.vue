<template>
  <div>
    <el-divider>
      <i class="el-icon-chat-line-square"></i>
      <span style="padding: 0 10px;">讨论</span>
      <el-badge
        type="primary"
        :max="99"
        :value="total">
      </el-badge>
    </el-divider>
    <div v-loading="discussionsLoading">
      <div class="join-discussion">
        <el-form
          ref="discussForm"
          :model="discussForm">
          <el-form-item
            prop="content"
            :rules="[
              { required: true, message: ' ', trigger: 'change' }
            ]">
            <el-input
              type="textarea"
              :autosize="{ minRows: 5 }"
              :disabled="posting"
              placeholder="请输入讨论内容"
              v-model="discussForm.content">
            </el-input>
          </el-form-item>
        </el-form>
        <div style="text-align: right; margin: 10px 0 20px;">
          <el-button
            type="primary"
            size="medium"
            icon="el-icon-s-promotion"
            :loading="posting"
            @click="handlePostDiscussion">
            发布
          </el-button>
        </div>
      </div>
      <div class="discussion-options">
        <el-radio-group
          v-model="query.trend"
          size="medium"
          @change="handleConditionChanged"
          style="float: left;">
          <el-radio-button :label="true">
            <i class="el-icon-news"></i>
            热门
          </el-radio-button>
          <el-radio-button :label="false">
            <i class="el-icon-time"></i>
            时间
          </el-radio-button>
        </el-radio-group>
        <el-button
          circle
          size="medium"
          icon="el-icon-refresh"
          :disabled="refreshing"
          @click="refreshDiscussions"
          style="float: right;">
        </el-button>
      </div>
      <el-timeline style="padding-left: 3%;">
        <el-timeline-item
          v-for="discussion in discussions"
          :key="discussion.id"
          :color="discussion.color"
          :timestamp="query.trend ? `👍 ${discussion.votes} 💬 ${discussion.replies}` : discussion.pubDate"
          placement="top"
          class="timeline-item">
          <discussion-item
            :discussion="discussion"
            :displayTime="query.trend">
          </discussion-item>
        </el-timeline-item>
      </el-timeline>
      <div style="text-align: center;">
        <el-link
          v-if="discussions.length !== total"
          type="primary"
          :disabled="discussionsLoading"
          @click="handleMoreDiscussions">
          {{ discussionsLoading ? '加载中' : '更多' }}
        </el-link>
        <el-link
          v-else
          type="primary"
          disabled>
          已全部加载
        </el-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import DiscussionItem from './item'
import {
  findChapterDiscussions,
  postChapterDiscussion,
  likeChapterDiscussion
} from '@/api/learn'

export default {
  components: {
    DiscussionItem
  },
  data() {
    return {
      discussionsLoading: true,
      refreshing: false,
      posting: false,
      total: 0,
      discussions: [],
      discussForm: {
        content: '',
        replyTo: null
      },
      chapterId: this.$route.params.chapterId,
      query: {
        page: 0,
        size: 5,
        courseId: this.$route.params.courseId,
        trend: true,
        reverse: true
      }
    }
  },
  computed: mapState(['user']),
  methods: {
    handleConditionChanged() {
      this.query.page = 0
      this.refreshDiscussions()
    },
    refreshDiscussions() {
      this.discussionsLoading = true
      this.refreshing = true
      findChapterDiscussions(this.chapterId, this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.discussions = data.payload.data
        })
        .finally(() => {
          this.discussionsLoading = false
          setTimeout(() => {
            this.refreshing = false
          }, 5000)
        })
    },
    handleMoreDiscussions() {
      this.discussionsLoading = true
      this.query.page++
      findChapterDiscussions(this.chapterId, this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.discussions.push(...data.payload.data)
        })
        .finally(() => this.discussionsLoading = false)
    },
    handlePostDiscussion() {
      this.$refs.discussForm.validate(valid => {
        if (valid) {
          this.posting = true
          postChapterDiscussion(this.query.courseId, this.chapterId, this.discussForm)
            .then(response => {
              const data = response.data
              this.discussions.unshift({
                ...data.payload,
                userNickname: this.user.nickname,
                userAvatar: this.user.avatar,
                color: '#0bbd87'
              })
              this.total++
              this.discussForm.content = ''
            })
            .catch(() => this.$message.error('发布失败'))
            .finally(() => this.posting = false)
        }
      })
    },
    handleLikeDiscussion(discussion) {
      likeChapterDiscussion(discussion.id, this.query.courseId)
        .then(() => discussion.votes++)
    }
  },
  mounted() {
    this.refreshDiscussions()
  }
}
</script>

<style scoped>
.join-discussion {
  margin: 10px 3%;
}
.discussion-options {
  margin: 0 3% 30px;
}
.discussion-options:after {
  content: "";
  display: block;
  height: 0;
  clear: both;
}

.timeline-item >>> .el-timeline-item__timestamp {
  word-spacing: 1em;
}
</style>