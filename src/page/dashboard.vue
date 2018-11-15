<template>
    <div>
        <el-tabs v-model="editableTabsValue" editable @edit="handleTabsEdit" @tab-click="clientHandleClick">
          <el-tab-pane
            :key="item.name"
            v-for="item in editableTabs"
            :label="item.title"
            :name="item.name"
          >
          </el-tab-pane>
        </el-tabs>
        <div v-loading="loading">

          <el-dialog
            title="Scrapyd 主机部署"
            :visible.sync="dialogVisibleClient"
            width="30%"
            :before-close="canClientClose">
              <el-form :model="clientForm" :rules="clientRules" ref="clientForm" label-width="100px" class="demo-ruleForm">
                  <el-form-item label="host" prop="host">
                      <el-input v-model="clientForm.host" ref="client_focus" @keyup.13.native="canAddClient('clientForm')" placeholder='请输入需要部署的 Scrapyd 主机IP'></el-input>
                  </el-form-item>
                  <el-form-item label="port" prop="port">
                      <el-input v-model="clientForm.port" @keyup.13.native="canAddClient('clientForm')" placeholder='请输入需要部署的 Scrapyd 主机端口'></el-input>
                  </el-form-item>
                  <el-form-item>
                      <el-button type="primary" @click="canAddClient('clientForm')">部署主机</el-button>
                      <el-button @click="canResetFormClient('clientForm')">重置</el-button>
                  </el-form-item>
              </el-form>
          </el-dialog>

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
                      <el-input v-model="ruleForm.pro_name" ref="pro_focus" @keyup.13.native="canAddProject('ruleForm')" placeholder='请输入项目名称'></el-input>
                  </el-form-item>
                  <el-form-item label="版本号" prop="version">
                      <el-input v-model="ruleForm.version" @keyup.13.native="canAddProject('ruleForm')" placeholder='请输入项目版本号'></el-input>
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
                      <el-button type="primary" @click="canAddProject('ruleForm')">部署项目</el-button>
                      <el-button @click="resetForm('ruleForm')">重置</el-button>
                  </el-form-item>
              </el-form>
          </el-dialog>

          <el-card v-loading="proLoading" class="box-card" :body-style="{padding:'4px 16px 16px'}">
              <div slot="header" class="clearfix">
                  <span>项目列表</span>
                  <el-button style="float: right; padding: 3px 0" type="text" @click="loadProList(host, port)">
                      <i :class="['header-icon',proRefreshIcon]"></i>
                  </el-button>
              </div>
              <el-collapse v-model="spiActiveNames">
                  <div :key="index" v-for="(pro, key, index) in proData">
                      <el-collapse-item :name="key">
                          <template slot="title">
                              <el-button type="text" icon="el-icon-delete" @click.stop="getIsDelete(pro[0].pro_name)" style="font-size:16px; color: #FF6347">{{pro[0].pro_name}}</el-button>
                          </template>
                          <el-table :data="pro" style="width: 100%">
                              <el-table-column prop="pro_name" v-if="false" label="项目名">
                              </el-table-column>
                              <el-table-column prop="spi_name" label="爬虫名">
                              </el-table-column>
                              <el-table-column fixed="right" label="操作">
                                  <template slot-scope="scope">
                                      <el-button @click="loadStartSpider(scope.row)" type="primary" size="mini" icon="el-icon-star-on" plain>启动</el-button>
                                  </template>
                              </el-table-column>
                          </el-table>
                      </el-collapse-item>
                  </div>
              </el-collapse>
          </el-card>

          <el-card v-loading="statusLoading" class="box-card" :body-style="{padding:'4px 16px 16px'}">
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
                  <el-button style="float: right; padding: 3px 0" type="text" @click="loadSpiderStatus()">
                      <i :class="['header-icon',statusRefreshIcon]"></i>
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
                                  <el-button @click="canStopSpider(scope.row)" type="danger" plain size="mini">Stop</el-button>
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
                                  <el-button @click="canStopSpider(scope.row)" type="danger" plain size="mini">Stop</el-button>
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
      proRefreshIcon: "el-icon-refresh",
      statusRefreshIcon: "el-icon-refresh",
      selectPro: "",
      proStatus: "",
      duration: 2000,
      loading: false,
      proLoading: false,
      statusLoading: false,

      host: "",
      port: "",
      editableTabsValue: "2",
      editableTabs: [],
      tabIndex: 1,
      maxTabIndex: 0,
      dialogVisibleClient: false,
      clientForm: {
        host: "127.0.0.1",
        port: 6800
      },
      clientRules: {
        host: [{ required: true, message: "请输入连接IP", trigger: "blur" }],
        port: [{ required: true, message: "请输入端口号", trigger: "blur" }]
      }
    };
  },
  mounted() {
    this.getClients();
  },

  methods: {
    /**
     * 部署项目，egg文件上传
     */
    canAddProject(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        if (valid) {
          for (let i = 0; i < this.proList.length; i++) {
            if (this.proList[i] == this.ruleForm.pro_name) {
              this.error("项目名不得与已有项目名相同");
              return;
            }
          }
          let fd = new FormData();
          console.log(this.file);
          fd.append("file", this.file.raw);
          fd.append("project", this.ruleForm.pro_name);
          fd.append("version", this.ruleForm.version);
          this.$axios.post("/gxyf/upload", fd).then(res => {
            if (res.data.status == "ok") {
              this.loadProList();
              this.success("添加项目成功");
            } else {
              this.error(res.data.msg);
            }
          });
          this.dialogVisible = false;
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    /**
     * 加载项目列表
     */
    loadProList() {
      this.canProLoadingTimeOut();
      this.proRefreshIcon = "el-icon-loading";
      this.$axios.get("/gxyf/can_data_list").then(res => {
        if (res.data.status == "ok") {
          this.proData = res.data.data;
          let pro = res.data.data;
          this.proList = [];
          for (let i = 0; i < pro.length; i++) {
            this.proList.push(pro[i][0].pro_name);
            this.spiActiveNames.push(i);
          }
          this.proLoading = false;
          this.loadSpiderStatus();
        } else {
          this.proEmpty();
          this.info(res.data.msg);
          this.proLoading = false;
          this.loadSpiderStatus();
        }
        this.proRefreshIcon = "el-icon-refresh";
      });
    },

    /**启动爬虫 */
    loadStartSpider(row) {
      let params = "?project=" + row.pro_name + "&spider=" + row.spi_name;
      this.$axios.get("/gxyf/start" + params).then(res => {
        if (res.data.status == "ok") {
          this.loadSpiderStatus();
          this.success(res.data.msg);
        } else {
          this.error(res.data.msg);
        }
      });
    },

    /**
     * 停止爬虫
     */
    canStopSpider(row) {
      let params = "?project=" + row.project + "&job=" + row.id;
      this.$axios.get("/gxyf/stop" + params).then(res => {
        if (res.data.status == "ok") {
          this.loadSpiderStatus();
          this.success("停止爬虫成功");
        } else {
          this.error(res.data.msg);
        }
      });
    },

    /**
     * 删除确认框
     */
    getIsDelete(pro_name) {
      this.$confirm("确认删除该项目")
        .then(_ => {
          this.canDeleteProject(pro_name);
        })
        .catch(_ => {});
    },

    /**
     * 删除
     */
    canDeleteProject(pro_name) {
      this.$axios.get("/gxyf/delete?project=" + pro_name).then(res => {
        if (res.data.status == "ok") {
          this.loadProList();
          this.success("删除项目成功");
        } else {
          this.error(res.data.message);
        }
      });
    },

    /**
     * 查看日志
     */
    openLog(row) {
      window.open(row.log);
    },

    /**
     * 刷新爬虫运行状态列表
     */
    selectChange() {
      this.loadSpiderStatus();
    },

    /**
     * 查看爬虫运行状态
     */
    loadSpiderStatus() {
      this.canStatusLoadingTimeOut();
      this.statusRefreshIcon = "el-icon-loading";
      this.proStatus =
        this.selectPro == "" ? this.proList.join(",") : this.selectPro;
      this.$axios.get("/gxyf/status?project=" + this.proStatus).then(res => {
        if (res.data[0].status == "ok") {
          if (
            JSON.stringify(res.data) == this.hisJonData &&
            res.data[0].pending.length != 0 &&
            res.data[0].running.length != 0
          ) {
            setTimeout(() => {
              this.loadSpiderStatus();
            }, this.timeout);
            if (this.timeout < 120000) {
              this.timeout = this.timeout * 2;
            }
            return;
          }
          this.hisJonData = JSON.stringify(res.data);
          this.statusEmpty();
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
                this.loadSpiderStatus();
              }, 1000);
            }
          }
          this.statusLoading = false;
        } else {
          this.statusEmpty();
          this.info(res.data[0].msg);
          this.statusLoading = false;
        }
        this.statusRefreshIcon = "el-icon-refresh";
      });
    },

    /**
     * 打开添加项目窗口
     */
    dialogVisibleOpen() {
      this.dialogVisible = true;
      this.file = {};
      this.fileList = [];
      this.resetForm("ruleForm");
      this.$nextTick(() => {
        this.$refs.pro_focus.focus();
      });
    },

    /**
     * 文件清除
     */
    handleRemove(file, fileList) {
      this.ruleForm.fileFlag = "";
      this.fileList = [];
      this.file = {};
    },

    /**
     * 文件变化触发
     */
    fileChange(file, fileList) {
      this.file = file;
      this.ruleForm.fileFlag = "file";
      this.fileList = fileList;
    },

    /**
     * 获取主机列表
     */
    getClients() {
      this.$axios.get("/gxyf/clients").then(res => {
        if (res.data.status == "ok") {
          this.editableTabs = res.data.data;
          if (this.editableTabs.length !== 0) {
            let cliensLength = this.editableTabs.length;
            this.editableTabsValue = this.editableTabs[0].name + "";
            this.tabIndex = this.editableTabs[0].name;
            this.maxTabIndex = this.editableTabs[cliensLength - 1].name;
            this.canSelectClient(
              this.editableTabs[0].host,
              this.editableTabs[0].port,
              "search"
            );
          }
        } else {
          this.error(res.data.msg);
        }
      });
    },

    /**
     * 切换，新增主机
     */
    canSelectClient(host, port, type) {
      this.canLoadingTimeOut();
      let url = "/gxyf/daemonstatus?host=" + host + "&port=" + port;
      this.$axios.get(url).then(res => {
        if (res.data.status == "ok") {
          this.loadProList();
          this.host = host;
          this.port = port;
          if (type == "add") {
            let newTabName = ++this.maxTabIndex + "";
            let updateConfUrl =
              "/gxyf/updateConf?host=" +
              host +
              "&port=" +
              port +
              "&name=" +
              newTabName +
              "&type=add";
            this.$axios.get(updateConfUrl).then(rest => {
              if (rest.data.status == "ok") {
                console.log("写入conf成功");
                this.editableTabs.push({
                  title: host + ":" + port,
                  name: newTabName
                });
                this.editableTabsValue = newTabName;
                this.dialogVisibleClient = false;
                this.success("添加主机成功");
              } else {
                console.log("写入conf失败");
              }
            });
          } else {
            this.loading = false;
          }
        } else {
          this.error(res.data.msg);
          setTimeout(() => {
            this.getClients();
          }, 10000);
          this.loading = false;
        }
      });
    },

    /**
     * 添加 scraptd 主机
     */
    canAddClient(clientForm) {
      this.$refs[clientForm].validate(valid => {
        if (valid) {
          this.canSelectClient(
            this.clientForm.host,
            this.clientForm.port,
            "add"
          );
        }
      });
    },

    /**
     * 切换主机
     */
    clientHandleClick(tab, event) {
      console.log(tab, event);
      let params = tab.label.split(":");
      this.canSelectClient(params[0], params[1], "search");
    },

    /**
     * 重置表单
     */
    resetForm(formName) {
      this.$nextTick(() => {
        this.$refs[formName].resetFields();
      });
    },
    canResetFormClient(formName) {
      this.$nextTick(() => {
        this.$refs[formName].resetFields();
      });
    },

    /**
     * 关闭 dialog 页面
     */
    canClientClose() {
      this.dialogVisibleClient = false;
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

    /**
     * 清空项目，运行状态列表
     */
    proEmpty() {
      this.proData = [];
      this.proList = [];
      this.spiActiveNames = [];
    },
    statusEmpty() {
      this.finishedTableData = [];
      this.runningTableData = [];
      this.pendingTableData = [];
    },

    /**
     * 新增，删除 tab 页
     */
    handleTabsEdit(targetName, action) {
      if (action === "add") {
        this.dialogVisibleClient = true;
        this.$nextTick(() => {
          this.$refs.client_focus.focus();
        });
        this.canResetFormClient("clientForm");
      }
      if (action === "remove") {
        this.canLoadingTimeOut();
        let updateConfUrl =
          "/gxyf/updateConf?name=" + targetName + "&type=remove";
        this.$axios.get(updateConfUrl).then(rest => {
          if (rest.data.status == "ok") {
            console.log("写入conf成功");
            let tabs = this.editableTabs;
            let activeName = this.editableTabsValue;
            if (activeName === targetName) {
              tabs.forEach((tab, index) => {
                if (tab.name === targetName) {
                  let nextTab = tabs[index + 1] || tabs[index - 1];
                  if (nextTab) {
                    activeName = nextTab.name;
                  }
                }
              });
            }
            this.editableTabsValue = activeName;
            this.editableTabs = tabs.filter(tab => tab.name !== targetName);
            console.log(this.editableTabs);
            for (let i = 0; i < this.editableTabs.length; i++) {
              if (this.editableTabs[i].name == this.editableTabsValue) {
                let hpArray = this.editableTabs[i].title.split(":");
                this.canSelectClient(hpArray[0], hpArray[1], "search");
              }
            }
            if (this.editableTabs.length === 0) {
              this.proEmpty();
              this.statusEmpty();
            }
            this.success("删除主机成功");
            this.loading = false;
          } else {
            console.log("写入conf失败");
          }
        });
      }
    },

    /**
     * 加载动画，８s未加载出将关闭加载动画
     */
    canLoadingTimeOut() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 8000);
    },
    canProLoadingTimeOut() {
      this.proLoading = true;
      setTimeout(() => {
        this.proLoading = false;
      }, 8000);
    },
    canStatusLoadingTimeOut() {
      this.statusLoading = true;
      setTimeout(() => {
        this.statusLoading = false;
      }, 8000);
    },

    /**
     * 提示信息
     */
    success(msg) {
      this.$notify({
        title: "成功",
        duration: this.duration,
        message: msg,
        type: "success",
        duration: 3500
      });
    },
    warning(msg) {
      this.$notify({
        title: "警告",
        duration: this.duration,
        message: msg,
        type: "warning",
        duration: 3500
      });
    },
    info(msg) {
      this.$notify.info({
        title: "消息",
        duration: this.duration,
        message: msg,
        duration: 3500
      });
    },
    error(msg) {
      this.$notify.error({
        title: "错误",
        duration: this.duration,
        message: msg,
        duration: 3500
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
