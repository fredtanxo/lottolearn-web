<template>
  <el-dialog
    title="创建课程"
    :visible.sync="dialog"
    class="add-dialog"
    @close="beforeClose">
    <el-form
      ref="formAdd"
      v-if="step === 0"
      :model="formAdd"
      label-width="80px"
      :rules="formAddRules">
      <el-form-item
        label="课程名称"
        prop="name">
        <el-input
          ref="nameInputRef"
          v-model="formAdd.name"
          :disabled="loadingAdd"
          placeholder="请填写课程名称">
        </el-input>
      </el-form-item>
      <el-form-item label="权限">
        <el-radio-group
          v-model="formAdd.visibility"
          size="medium"
          :disabled="loadingAdd">
          <el-radio-button :label="false">私密</el-radio-button>
          <el-radio-button :label="true">公开</el-radio-button>
        </el-radio-group>
        <span style="padding: 0 8px;">
          <el-tooltip
            effect="dark"
            content="公开课程意味着其他人可以从「发现」页面加入本课程"
            placement="top">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </span>
      </el-form-item>
      <el-form-item
        label="课程简介"
        prop="description">
        <el-input
          type="textarea"
          v-model="formAdd.description"
          :disabled="loadingAdd"
          placeholder="描述一下课程内容">
        </el-input>
      </el-form-item>
      <el-form-item
        label="学期"
        prop="termId">
        <el-select
          v-model="formAdd.termId"
          :disabled="loadingAdd"
          placeholder="请选择学期">
          <el-option
            v-for="term in terms"
            :key="term.id"
            :label="`${term.name} [${term.termStart} - ${term.termEnd}]`"
            :value="term.id">
          </el-option>
        </el-select>
        <el-button
          icon="el-icon-plus"
          style="margin-left: 10px;"
          @click="termDialog = true">
          添加
        </el-button>
        <el-dialog
          title="添加学期"
          :visible.sync="termDialog"
          class="add-dialog"
          append-to-body
          destroy-on-close>
          <el-form
            ref="formTerm"
            :model="formTerm"
            label-width="80px"
            :rules="formTermRules">
            <el-form-item
              label="学期名称"
              prop="name">
              <el-input
                v-model="formTerm.name"
                placeholder="请填写学期名称">
              </el-input>
            </el-form-item>
            <el-form-item
              label="学期时段"
              prop="range">
              <el-date-picker
                v-model="formTerm.range"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </el-form-item>
          </el-form>
          <span
            slot="footer"
            v-if="step === 0">
            <el-button
              type="primary"
              icon="el-icon-check"
              @click="handleAddTerm"
              :loading="loadingTerm">
              添加
            </el-button>
          </span>
        </el-dialog>
      </el-form-item>
      <el-form-item
        prop="credit"
        label="学分">
        <el-input-number
          v-model="formAdd.credit"
          :min="0"
          :max="10"
          label="请填写学分">
        </el-input-number>
      </el-form-item>
    </el-form>
    <result
      v-else
      :result="result"
      mode="add"
      :callback="handleLearn">
    </result>
    <span
      slot="footer"
      v-if="step === 0">
      <el-button
        type="primary"
        icon="el-icon-check"
        @click="handleAddCourse"
        :loading="loadingAdd">
        创建
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import Result from './result'

import {
  addCourse,
  findAddCourseResult,
  findAllTerms,
  addTerm
} from '@/api/course'
import { convertDate } from '@/utils'

export default {
  components: {
    Result
  },
  props: {
    addDialog: Boolean,
    setAddDialog: Function,
    callback: Function
  },
  data() {
    return {
      dialog: false,
      termDialog: false,
      timer: null,
      loadingAdd: false,
      loadingTerm: false,
      step: 0,
      mode: '',
      terms: [],
      result: {
        success: false,
        message: '',
        courseId: ''
      },
      formAdd: {
        name: '',
        visibility: false,
        description: '',
        termId: '',
        credit: 1
      },
      formTerm: {
        name: '',
        range: [new Date(), new Date()]
      },
      formAddRules: {
        name: [
          { required: true, message: '必须提供课程名称', trigger: 'blur' }
        ],
        termId: [
          { required: true, message: '必须选择一个学期', trigger: 'blur' }
        ],
        credit: [
          { required: true, message: '必须提供学分', trigger: 'blur' },
          { type: 'number', message: '学分必须是数字' }
        ]
      },
      formTermRules: {
        name: [
          { required: true, message: '必须提供学期名称', trigger: 'blur' }
        ],
        range: [
          {
            validator: (rule, value, callback) => {
              if (!value[0] || !value[1]) {
                callback(new Error('必须提供学期时段'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    addDialog(val) {
      this.$nextTick(() => this.dialog = val)
    },
    dialog(val) {
      if (val) {
        this.step = 0
        this.result = {}
        this.formAdd = { visibility: false, credit: 1 }
        this.refreshTerms()
        this.$nextTick(() => this.$refs.nameInputRef.focus())
      }
    }
  },
  methods: {
    // 刷新学期
    refreshTerms() {
      findAllTerms()
        .then(response => {
          const data = response.data
          this.terms = data.payload.data
        })
        .catch(() => this.$message.error('无法获取学期信息'))
    },
    // 添加学期
    handleAddTerm() {
      this.$refs.formTerm.validate(valid => {
        if (valid) {
          this.loadingTerm = true
          addTerm({
            name: this.formTerm.name,
            termStart: convertDate(this.formTerm.range[0]),
            termEnd: convertDate(this.formTerm.range[1])
          })
          .then(response => {
            const data = response.data
            if (data.code === 200) {
              this.$message.success('添加成功')
              this.loadingAdd = false
              this.termDialog = false
              this.refreshTerms()
            } else {
              this.$message.error(data.message)
            }
          })
          .catch(() => this.$message.error('添加失败'))
          .finally(() => {
            this.loadingTerm = false
            this.refreshTerms()
          })
        }
      })
    },
    // 添加课程
    handleAddCourse() {
      this.$refs.formAdd.validate(valid => {
        if (valid) {
          this.loadingAdd = true
          addCourse(this.formAdd)
            .then(response => {
              const data = response.data
              this.handleQueryAddCourse(data, 0)
            })
            .catch(() => {
              this.$message.error('添加失败')
              this.loadingAdd = false
            })
        }
      })
    },
    // 查询添加课程状态
    handleQueryAddCourse(id, timeout) {
      this.timer = setTimeout(() => {
        findAddCourseResult(id)
          .then(response => {
            const data = response.data
            if (data) {
              clearTimeout(this.timer)
              this.result = {
                success: data.code === 200,
                message: data.message,
                invitationCode: data.invitationCode,
                courseId: data.courseId
              }
              this.step++
              this.callback()
              this.loadingAdd = false
            } else {
              this.handleQueryAddCourse(id, timeout >= 3 ? 3 : timeout + 1)
            }
          })
          .catch(err => console.error(err))
      }, timeout * 1000)
    },
    beforeClose() {
      this.setAddDialog(false)
      if (this.$refs.formAdd) {
        this.$refs.formAdd.resetFields()
      }
    },
    handleLearn(path) {
      this.setAddDialog(false)
      setTimeout(() => {
        this.$router.push(path)
      }, 300)
    }
  }
}
</script>

<style scoped>
.add-dialog >>> .el-dialog {
  position: fixed;
  width: 520px;
  right: 20px;
  bottom: 20px;
}
.add-code {
  font-family: monospace;
  color: #409EFF;
}
</style>
