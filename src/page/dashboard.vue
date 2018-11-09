<template>
    <div>
        <div class="add-btn">
            <el-button type="primary" icon="el-icon-circle-plus" plain @click="dialogVisibleOpen()">项目部署</el-button>
        </div>
    
        <el-dialog
        title="项目部署"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
                <el-form-item label="项目名称" prop="pro_name">
                    <el-input v-model="ruleForm.pro_name"></el-input>
                </el-form-item>
                <el-form-item label="版本号" prop="version">
                    <el-input v-model="ruleForm.version"></el-input>
                </el-form-item>
                <el-form-item prop="fileFlag">
                <el-upload
                class="upload-demo"
                ref="upload"
                :file-list="fileList"
                :on-remove="handleRemove"
                :limit="1"
                :on-change="fileChange"
                :auto-upload="false"
                action="">
                <el-button slot="trigger" icon="el-icon-upload" size="small" plain type="primary">选取egg文件</el-button>
                </el-upload>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="add_project('ruleForm')">添加项目</el-button>
                    <el-button @click="resetForm('ruleForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-card class="box-card" :body-style="{padding:'4px 16px 16px'}">
            <div slot="header" class="clearfix">
                <span>项目列表</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="pro_list()">
                    <i :class="['header-icon',refreshIcon]"></i>
                </el-button>
            </div>
            <el-collapse v-model="spiActiveNames">
                <div :key="index" v-for="(pro, key, index) in proData">
                    <el-collapse-item :name="key">
                        <template slot="title">
                            <el-button type="text" icon="el-icon-delete" @click.stop="is_delete(pro[0].pro_name)" style="font-size:16px; color: #FF6347">{{pro[0].pro_name}}</el-button>
                        </template>
                        <el-table :data="pro" style="width: 100%">
                            <el-table-column prop="pro_name" v-if="false" label="项目名">
                            </el-table-column>
                            <el-table-column prop="spi_name" label="爬虫名">
                            </el-table-column>
                            <el-table-column fixed="right" label="操作">
                                <template slot-scope="scope">
                                    <el-button @click="start_spider(scope.row)" type="primary" size="mini" icon="el-icon-star-on" plain>启动</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-collapse-item>
                </div>
            </el-collapse>
        </el-card>

    <el-card class="box-card" :body-style="{padding:'4px 16px 16px'}">
        <div slot="header" class="clearfix">
            <span>运行状态</span>
            <el-select v-model="selectPro" filterable clearable placeholder="请选择" size="mini" @change="selectChange()">
                <el-option
                v-for="pro in proList"
                :key="pro"
                :label="pro"
                :value="pro">
                </el-option>
            </el-select>
            <el-button style="float: right; padding: 3px 0" type="text" @click="spider_status()">
                <i :class="['header-icon',refreshIcon]"></i>
            </el-button>
        </div>
        <el-collapse v-model="jobActiveNames">
            <el-collapse-item name="1">
                <template slot="title">
                待处理<i class="header-icon el-icon-remove" style="color: #EE9A00"></i>
                </template>
                <el-table :data="pendingTableData" style="width: 100%">
                    <el-table-column prop="project" label="Project">
                    </el-table-column>
                    <el-table-column prop="spider" label="Spider">
                    </el-table-column>
                    <el-table-column prop="id" label="Job">
                    </el-table-column>
                    <el-table-column fixed="right" label="Stop">
                        <template slot-scope="scope">
                            <el-button @click="stop_spider(scope.row)" type="danger" plain size="mini">Stop</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-collapse-item>
            <el-collapse-item name="2">
                <template slot="title">
                正在运行<i class="header-icon el-icon-loading" style="color: #63B8FF"></i>
                </template>
                <el-table :data="runningTableData" style="width: 100%">
                    <el-table-column prop="project" label="Project">
                    </el-table-column>
                    <el-table-column prop="spider" label="Spider">
                    </el-table-column>
                    <el-table-column prop="start_time" label="Start">
                    </el-table-column>
                    <el-table-column prop="log" label="log" v-if="false">
                    </el-table-column>
                    <el-table-column fixed="right" label="Stop">
                        <template slot-scope="scope">
                            <el-button @click="stop_spider(scope.row)" type="danger" plain size="mini">Stop</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="Log" style="color: #63B8FF">
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="openLog(scope.row)">log</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-collapse-item>
            <el-collapse-item name="3">
                <template slot="title">
                已完成<i class="header-icon el-icon-circle-check" style="color: #7CCD7C"></i>
                </template>
                <el-table :data="finishedTableData" style="width: 100%">
                    <el-table-column prop="project" label="Project">
                    </el-table-column>
                    <el-table-column prop="spider" label="Spider">
                    </el-table-column>
                    <el-table-column prop="start_time" label="Start">
                    </el-table-column>
                    <el-table-column prop="end_time" label="Finish">
                    </el-table-column>
                    <el-table-column prop="id" label="Log" style="color: #63B8FF">
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="openLog(scope.row)">log</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="log" label="log" v-if="false">
                    </el-table-column>
                </el-table>
            </el-collapse-item>
        </el-collapse>
    </el-card>
    </div>
</template>

<script>
export default {
  data() {
    return {
      proData: [],
      pendingTableData: [],
      runningTableData: [],
      finishedTableData: [],
      hisJonData: "",
      dialogVisible: false,
      ruleForm: {
        pro_name: "",
        version: "",
        fileFlag: ""
      },
      rules: {
        pro_name: [
          { required: true, message: "请输入项目名称", trigger: "blur" }
        ],
        version: [{ required: true, message: "请输入版本号", trigger: "blur" }],
        fileFlag: [{ required: true, message: "请先选择文件", trigger: "blur" }]
      },
      fileList: [],
      file: {},
      timeout: 500,
      jobActiveNames: ["1", "2", "3"],
      spiActiveNames: [],
      proList: [],
      refreshIcon: "el-icon-refresh",
      selectPro: "",
      proStatus: "",
      duration: 2000
    };
  },
  mounted() {
    this.pro_list();
  },

  methods: {
    add_project(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          let fd = new FormData();
          console.log(this.file);
          fd.append("file", this.file.raw);
          fd.append("project", this.ruleForm.pro_name);
          fd.append("version", this.ruleForm.version);
          this.$axios.post("/gxyf/upload", fd).then(res => {

            if (res.data.status == "ok") {
              this.pro_list();
              this.success(res.data.msg)
            } else {
              this.error(res.data.msg)
            }
          });
          this.dialogVisible = false;
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    pro_list() {
      this.refreshIcon = "el-icon-loading";
      this.$axios.get("/gxyf/can_data_list").then(res => {
        if (res.data.status == "ok") {
          this.proData = res.data.data;
          let pro = res.data.data;
          for (let i = 0; i < pro.length; i++) {
            this.proList.push(pro[i][0].pro_name);
            this.spiActiveNames.push(i);
          }
          this.spider_status();
        } else {
          this.error(res.data.msg)
        }
      });
    },
    start_spider(row) {
      let params = "?project=" + row.pro_name + "&spider=" + row.spi_name;
      this.$axios.get("/gxyf/start" + params).then(res => {
        if (res.data.status == "ok") {
          this.spider_status();
          this.success(res.data.msg)
        } else {
          this.error(res.data.msg)
        }
      });
    },
    stop_spider(row) {
      let params = "?project=" + row.project + "&job=" + row.id;
      this.$axios.get("/gxyf/stop" + params).then(res => {
        if (res.data.status == "ok") {
          this.spider_status();
          this.success(res.data.msg)
        } else {
          this.error(res.data.msg)
        }
      });
    },
    is_delete(pro_name){
        this.$confirm('确认删除该项目')
          .then(_ => {
            this.delete_project(pro_name);
          })
          .catch(_ => {});
    },
    delete_project(pro_name) {
      this.$axios.get("/gxyf/delete?project=" + pro_name).then(res => {
        if (res.data.status == "ok") {
          this.pro_list();
          this.success(res.data.msg)
        } else {
          this.error(res.data.msg)
        }
      });
    },
    openLog(row) {
      window.open(row.log);
    },
    selectChange() {
      this.spider_status();
    },
    spider_status() {
      this.refreshIcon = "el-icon-loading";
      this.proStatus =
        this.selectPro == "" ? this.proList.join(",") : this.selectPro;
      this.$axios.get("/gxyf/status?project=" + this.proStatus).then(res => {
        if (res.data[0].status == "ok") {
          if (
            JSON.stringify(res.data) == this.hisJonData &&
            res.data[0].finished.length != 0
          ) {
            setTimeout(() => {
              this.spider_status();
            }, this.timeout);
            if (this.timeout < 120000) {
              this.timeout = this.timeout * 2;
            }
            this.refreshIcon = "el-icon-refresh";
            return;
          }
          this.hisJonData = JSON.stringify(res.data);
          this.finishedTableData = [];
          this.runningTableData = [];
          this.pendingTableData = [];
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].finished.length != 0) {
              for (let j = 0; j < res.data[i].finished.length; j++) {
                this.finishedTableData.push(res.data[i].finished[j]);
              }
            }
            if (res.data[i].running.length != 0) {
              for (let j = 0; j < res.data[i].running.length; j++) {
                this.runningTableData.push(res.data[i].running[j]);
              }
            }
            if (res.data[i].pending.length != 0) {
              for (let j = 0; j < res.data[i].pending.length; j++) {
                this.pendingTableData.push(res.data[i].pending[j]);
              }
            }
            if (
              res.data[i].pending.length != 0 ||
              res.data[i].running.length != 0
            ) {
              setTimeout(() => {
                this.spider_status();
              }, 1000);
            }
          }
          this.refreshIcon = "el-icon-refresh";
        } else {
          this.error(res.data[0].msg)
        }
      });
    },
    handleClose(done) {
      if (this.ruleForm.fileFlag == "") {
        done();
        return;
      }
      this.$confirm("确认关闭？上传文件将清除")
        .then(_ => {
          this.fileList = [];
          done();
        })
        .catch(_ => {});
    },
    dialogVisibleOpen() {
      this.dialogVisible = true;
      this.ruleForm.pro_name = "";
      this.ruleForm.version = "";
      this.ruleForm.fileFlag = "";
      this.file = {};
      this.fileList = [];
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.fileList = [];
    },
    handleRemove(file, fileList) {
      this.ruleForm.fileFlag = "";
      this.fileList = [];
      this.file = {};
    },
    fileChange(file, fileList) {
      this.file = file;
      this.ruleForm.fileFlag = "file";
      this.fileList = fileList;
    },
    success(msg) {
      this.$notify({
        title: "成功",
        duration: this.duration,
        message: msg,
        type: "success"
      });
    },
    warning(msg) {
      this.$notify({
        title: "警告",
        duration: this.duration,
        message: msg,
        type: "warning"
      });
    },
    info(msg) {
      this.$notify.info({
        title: "消息",
        duration: this.duration,
        message: msg
      });
    },
    error(msg) {
      this.$notify.error({
        title: "错误",
        duration: this.duration,
        message: msg
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../style/style.css";
@import "../style/dashboard.css";
</style>
