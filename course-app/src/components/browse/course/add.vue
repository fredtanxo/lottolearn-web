<template>
  <div class="dialog-container">
    <div class="dialog-body">
      <div
        class="select-mode"
        v-if="step === 0">
        <el-button
          icon="el-icon-document-add"
          @click="handleNextStep('add')">
          创建课程
        </el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button
          icon="el-icon-link"
          @click="handleNextStep('join')">
          加入课程
        </el-button>
      </div>
      <div
        class="info-form"
        v-if="step === 1 && mode === 'add'">
        <el-form
          ref="formAdd"
          :model="formAdd"
          label-width="80px"
          :rules="formAddRules">
          <el-form-item
            label="课程名称"
            prop="name">
            <el-input
              v-model="formAdd.name"
              autofocus
              placeholder="请填写课程名称">
            </el-input>
          </el-form-item>
          <el-form-item label="权限">
            <el-radio-group
              v-model="formAdd.visibility"
              size="medium">
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
          <el-form-item label="课程描述">
            <el-input
              type="textarea"
              v-model="formAdd.description"
              placeholder="描述一下课程内容">
            </el-input>
          </el-form-item>
          <el-form-item
            label="学期"
            prop="termId">
            <el-select v-model="formAdd.termId" placeholder="请选择学期">
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
              @click="dialog = true">
              添加
            </el-button>
            <el-dialog
              title="添加学期"
              :visible.sync="dialog"
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
                <div
                  class="dialog-foot"
                  v-if="step === 1">
                  <el-button
                    type="primary"
                    icon="el-icon-check"
                    @click="handleAddTerm"
                    :loading="loadingTerm">
                    添加
                  </el-button>
                </div>
              </el-form>
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
        <div
          class="dialog-foot"
          v-if="step === 1 && mode === 'add'">
          <el-button
            type="primary"
            icon="el-icon-check"
            @click="handleAddCourse"
            :loading="loadingAdd">
            创建
          </el-button>
        </div>
      </div>
      <div
        class="info-form"
        v-if="step === 1 && mode === 'join'">
        <el-form
          ref="formJoin"
          :model="formJoin"
          :rules="formJoinRules">
          <el-form-item
            prop="code"
            label="课程邀请码">
            <el-input
              v-model.trim="formJoin.code"
              autofocus
              @keydown.enter.native.prevent="handleJoinCourse"
              placeholder="请输入课程邀请码">
            </el-input>
          </el-form-item>
        </el-form>
        <div
          class="dialog-foot"
          v-if="step === 1 && mode === 'join'">
          <el-button
            type="primary"
            icon="el-icon-connection"
            @click="handleJoinCourse"
            :loading="loadingJoin">
            加入
          </el-button>
        </div>
      </div>
      <div
        class="add-result"
        v-if="step === 2">
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
            <span class="add-code">{{ result.invitationCode }}</span>
          </div>
          <div v-if="result.success">
            <el-link
              type="primary"
              :href="`/learn/${this.result.courseId}`">
              进入课堂
            </el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  addCourse,
  joinCourse,
  findAddCourseResult,
  findJoinCourseResult,
  findAllTerms,
  addTerm
} from '@/api/course'
import { convertDate } from '@/utils'

export default {
  props: {
    callback: Function
  },
  data() {
    return {
      dialog: false,
      timer: null,
      loadingAdd: false,
      loadingTerm: false,
      loadingJoin: false,
      step: 0,
      mode: '',
      terms: [],
      result: {
        success: false,
        message: '',
        invitationCode: '',
        courseId: ''
      },
      formAdd: {
        name: '',
        visibility: false,
        description: '',
        termId: '',
        credit: 0
      },
      formTerm: {
        name: '',
        range: [new Date(), new Date()]
      },
      formJoin: {
        code: ''
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
      },
      formJoinRules: {
        code: [
          { required: true, message: '必须提供邀请码才能加入', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 刷新学期
    refreshTerm() {
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
              this.dialog = false
              this.refreshTerm()
            } else {
              this.$message.error(data.message)
            }
          })
          .catch(() => this.$message.error('添加失败'))
          .finally(() => {
            this.loadingTerm = false
            this.refreshTerm()
          })
        }
      })
    },
    // 下一步
    handleNextStep(mode) {
      this.step++
      this.mode = mode
      if (mode === 'add') {
        this.refreshTerm()
      }
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
    // 邀请码加入课程
    handleJoinCourse() {
      this.$refs.formJoin.validate(valid => {
        if (valid) {
          this.loadingJoin = true
          joinCourse(this.formJoin.code)
            .then(response => {
              const data = response.data
              this.handleQueryJoinCourse(data, 0)
            })
            .catch(() => {
              this.$message.error('加入失败')
              this.loadingJoin = false
            })
        }
      })
    },
    // 查询加入课程状态
    handleQueryJoinCourse(id, timeout) {
      this.timer = setTimeout(() => {
        findJoinCourseResult(id)
          .then(response => {
            const data = response.data
            if (data) {
              clearTimeout(this.timer)
              this.result = {
                success: data.code === 200,
                message: data.message,
                courseId: data.courseId
              }
              this.step++
              this.callback()
              this.loadingJoin = false
            } else {
              this.handleQueryJoinCourse(id, timeout >= 3 ? 3 : timeout + 1)
            }
          })
          .catch(() => this.$message.error('请重试'))
      }, timeout * 1000)
    }
  }
}
</script>

<style>
.select-mode {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10vh 0;
}
.dialog-body {
  margin: 20px 0;
}
.dialog-foot {
  text-align: center;
}
.add-result {
  text-align: center;
  font-size: 2em;
  line-height: 2;
}
.add-code {
  font-family: monospace;
  color: #409EFF;
}
</style>
