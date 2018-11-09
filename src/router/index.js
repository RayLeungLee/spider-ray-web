import Vue from "vue";
import Router from "vue-router";
import Index from "@/components/index";
import Dashboard from "@/page/dashboard";
import Jobs from "@/page/jobs";

Vue.use(Router);

const router = new Router({
  routes: [
    { name: "Index", path: "/", component: Index,
    children: [
      {name: "Dashboard", path: "/dashboard", component: Dashboard},
      {name: "Jobs", path: "/jobs", component: Jobs}
  ]
  }
  ]
})
// router.beforeEach((to, from, next) => {
//   if (to.matched.some(res => res.meta.requireAuth)) {
//     // 判断是否需要登录权限
//     if (sessionStorage.getItem("username")) {
//       // 判断是否登录
//       next()
//     } else {
//       // 没登录则跳转到登录界面
//       next({
//         path: ""
//       });
//     }
//   } else {
//     next();
//   }
// })
export default router
