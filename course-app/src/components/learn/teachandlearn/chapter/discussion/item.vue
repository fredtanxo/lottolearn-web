<template>
  <el-card
    class="discussion-card"
    shadow="hover">
    <div class="discussion-item-wrapper">
      <div class="discussion-avatar">
        <el-avatar :src="discussion.userAvatar" :size="32"></el-avatar>
      </div>
      <div class="discussion-details">
        <div class="discussion-meta">
          <span>{{ discussion.userNickname }}</span>
          &emsp;
          <span v-if="displayTime">{{ discussion.pubDate }}</span>
        </div>
        <div class="discussion-content">
          <p>{{ discussion.content }}</p>
        </div>
        <div class="discussion-actions">
          <el-button
            type="text"
            class="discussion-action"
            @click="handleLikeDiscussion(discussion)">
            <i class="el-icon-arrow-up"></i>
            <span>{{ discussion.votes }}</span>
          </el-button>
          &emsp;
          <el-button
            type="text"
            class="discussion-action"
            @click="replying = !replying">
            <i class="el-icon-chat-line-square"></i>
            <span>{{ discussion.replies }}</span>
          </el-button>
        </div>
        <discussion-replies
          v-if="replying"
          :discussion="discussion">
        </discussion-replies>
      </div>
    </div>
  </el-card>
</template>

<script>
import DiscussionReplies from './reply'
import { likeChapterDiscussion } from '@/api/learn'

export default {
  props: {
    discussion: Object,
    displayTime: Boolean
  },
  components: {
    DiscussionReplies
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      replying: false
    }
  },
  methods: {
    handleLikeDiscussion(discussion) {
      likeChapterDiscussion(discussion.id, this.courseId)
        .then(() => discussion.votes++)
    }
  }
}
</script>

<style scoped>
@import './item.css';
</style>