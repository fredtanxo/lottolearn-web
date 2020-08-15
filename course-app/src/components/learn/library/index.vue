<template>
  <files-view
    :mode="0"
    :endpoint="`https://storage.lottolearn.com/media/course/${this.courseId}`">
  </files-view>
</template>

<script>
import FilesView from '@/components/common/files'

export default {
  components: {
    FilesView
  },
  data() {
    return {
      courseId: this.$route.params.courseId
    }
  }
}
</script>

<style>

</style>
