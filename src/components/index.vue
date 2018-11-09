<template>
  <el-container class="index_container">
    <el-aside :style="{flex: '0 0 '+flexWidth+' !important', width: 'auto !important'}" style="overflow: hidden !important;">
      <el-menu default-active="dashboard" class="sidebar-el-menu el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse"
        background-color="#001529" text-color="#bfcbd9" active-text-color="#fff"
        unique-opened router style="height: 100%; overflow: hidden !important;">
        <div class="page-title">
          <img src="../assets/logo.png" height="40px">
          <span style="font-size: 15px">SpiderRay</span>
        </div>
        <el-menu-item index="dashboard" class="is-active-once">
          <i class="el-icon-news"></i>
          <span slot="title">Dashboard</span>
        </el-menu-item>
        <el-menu-item index="jobs">
          <i class="el-icon-bell"></i>
          <span slot="title">Jobs</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <el-button class="menuBtn" :icon="closeOpenIcon" @click="closeOpen"></el-button>
        <div>
          <el-dropdown trigger="click">
            <a href="javascript:void(0)">
              用户：admin
              <i class="el-icon-setting" style="margin-right: 10px"></i>
            </a>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="logout">
                <span>注销登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <transition name="el-zoom-in-center">
          <router-view></router-view>
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        items: [],
        username: "",
        isCollapse: false,
        closeOpenIcon: "el-icon-d-arrow-left",
        // asideWidth: '15%',
        flexWidth: "220px",
        screenWidth: document.body.clientWidth,
        canRun: true,
      };
    },

    mounted() {
      window.onresize = () => {
        return (() => {
          window.screenWidth = document.body.clientWidth;
          this.screenWidth = window.screenWidth;
        })();
      };
      this.initAutoMenu();
    },
    watch: {
      screenWidth(val) {
        if (!this.canRun) {
          return;
        }
        this.initAutoMenu();
        this.canRun = false;
        setTimeout(() => {
          this.canRun = true;
        }, 300);
      }
    },

    methods: {
      initAutoMenu() {
        if (this.screenWidth < 1300) {
          this.isCollapse = true;
          this.closeOpenIcon = "el-icon-d-arrow-right";
          setTimeout(() => {
            this.flexWidth = "65px";
          }, 300);
        } else {
          this.isCollapse = false;
          this.closeOpenIcon = "el-icon-d-arrow-left";
          this.flexWidth = "220px";
        }
      },
      logout() {
        this.$confirm("此操作将退出本次登录, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            // this.$axios.post("/gxyf/xxxxxxxxxx").then(res => {
            // });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消退出"
            });
          });
      },

      closeOpen() {
        if (this.isCollapse === false) {
          this.isCollapse = true;
          this.closeOpenIcon = "el-icon-d-arrow-right";
          // this.asideWidth = '65px'
          setTimeout(() => {
            this.flexWidth = "65px";
          }, 300);
        } else {
          this.isCollapse = false;
          this.closeOpenIcon = "el-icon-d-arrow-left";
          // this.asideWidth = '15%'
          this.flexWidth = "220px";
        }
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    },
  };

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import "../style/style.css";
  @import "../style/index.css";
</style>
