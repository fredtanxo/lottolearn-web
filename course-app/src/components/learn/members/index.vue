<template>
  <div>
    <el-divider>
      <i class="el-icon-user"></i>
      <span style="padding: 0 10px;">课程成员</span>
      <el-badge
        type="primary"
        :value="total">
      </el-badge>
    </el-divider>
    <el-row
      v-loading="loading"
      :gutter="20"
      style="min-height: calc(100vh - 155px);">
      <el-col
        :xs="24"
        :sm="8"
        :lg="6"
        :xl="4"
        v-for="member in members"
        :key="member.id">
        <el-tooltip
          effect="dark"
          :content="`${member.enrollDate}加入`"
          placement="top">
          <el-card
            shadow="hover"
            class="member-card">
            <div class="member-info-wrapper">
              <el-avatar :src="member.userAvatar"></el-avatar>
                <span class="member-name">
                  {{ member.userNickname + (member.isTeacher ? '（教师）' : '') }}
                </span>
            </div>
          </el-card>
        </el-tooltip>
      </el-col>
    </el-row>
    <div
      v-if="members.length !== total"
      style="margin: 20px 0; text-align: center;">
      <el-link
        type="primary"
        :disabled="loading"
        @click="handleMoreMembers">
        {{ loading ? '加载中' : '更多' }}
      </el-link>
    </div>
  </div>
</template>

<script>
import { findCourseMembers } from '@/api/course'

export default {
  data() {
    return {
      loading: true,
      total: 0,
      members: [],
      query: {
        page: 0,
        size: 16
      },
      courseId: this.$route.params.courseId
    }
  },
  methods: {
    // 刷新课程成员列表
    refreshCourseMembers() {
      this.loading = true
      findCourseMembers(this.courseId, this.query)
        .then(response => {
          const data = response.data
          this.total = data.payload.total
          this.members = this.members.concat(data.payload.data)
        })
        .catch(() => this.$message.error('无法获取课程成员列表'))
        .finally(() => this.loading = false)
    },
    // 课程成员列表分页
    handleMoreMembers() {
      this.query.page++
      this.refreshCourseMembers()
    },
  },
  mounted() {
    this.refreshCourseMembers()
  }
}
</script>

<style scoped>
.member-card {
  display: inline-block;
  width: 100%;
  margin-right: 10px;
  margin-bottom: 15px;
}
.member-info-wrapper {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.member-name {
  margin-left: 15px;
}
</style>
