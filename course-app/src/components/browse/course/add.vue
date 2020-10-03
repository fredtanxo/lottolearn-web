<template>
  <div class="dialog-container">
    <div class="dialog-body">
      <div
        class="select-mode"
        v-if="step === 0">
        <el-button @click="handleNextStep('add')">创建课程</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button @click="handleNextStep('join')">加入课程</el-button>
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
          <el-form-item label="课程封面">
            <el-input v-model="formAdd.cover"></el-input>
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
              v-model="formJoin.code"
              autofocus
              placeholder="请输入课程邀请码">
            </el-input>
          </el-form-item>
        </el-form>
        <div
          class="dialog-foot"
          v-if="step === 1 && mode === 'join'">
          <el-button
            type="primary"
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
import { addCourse, joinCourse, findAllTerms, addTerm } from '@/api/course'
import { convertDate } from '@/utils'

export default {
  props: {
    callback: Function
  },
  data() {
    return {
      dialog: false,
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
        cover: '',
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
    refreshTerm() {
      findAllTerms()
        .then(response => {
          const data = response.data
          this.terms = data.payload.data
        })
        .catch(() => this.$message.error('无法获取学期信息'))
    },
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
    handleNextStep(mode) {
      this.step++
      this.mode = mode
      if (mode === 'add') {
        this.refreshTerm()
      }
    },
    handleAddCourse() {
      this.loadingAdd = true
      this.$refs.formAdd.validate(valid => {
        if (valid) {
          addCourse(this.formAdd)
            .then(response => {
              const data = response.data
              this.result = {
                success: data.code === 200,
                message: data.message,
                invitationCode: data.invitationCode,
                courseId: data.courseId
              }
              this.step++
              this.callback()
            })
            .catch(() => this.$message.error('添加失败'))
            .finally(() => this.loadingAdd = false)
        } else {
          this.loadingAdd = false
        }
      })
    },
    handleJoinCourse() {
      this.loadingJoin = true
      this.$refs.formJoin.validate(valid => {
        if (valid) {
          joinCourse(this.formJoin.code)
            .then(response => {
              const data = response.data
              this.result = {
                success: data.code === 200,
                message: data.message,
                courseId: data.courseId
              }
              this.step++
              this.callback()
            })
            .catch(err => {
              console.error(err)
              this.$message.error('加入失败')})
            .finally(() => this.loadingJoin = false)
        } else {
          this.loadingJoin = false
        }
      })
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
