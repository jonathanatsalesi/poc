import { createRouter as createVueRouter, createWebHashHistory, Router } from "vue-router";
import Home from "../views/Home.vue";
import Profile from "../views/Profile.vue";
import Subject from "../views/Subject.vue";
import ExternalApi from "../views/ExternalApi.vue";
import Tenant from "../views/Tenant.vue";
import Login from "../components/Login.vue";
import { createAuthGuard } from "@auth0/auth0-vue";
import { App } from 'vue';

export function createRouter(app: App): Router {
  return createVueRouter({
    routes: [
      {
        path: "/",
        name: "home",
        component: Home,
      },
      {
        path: "/login",
        name: "login",
        component: Login,
      },
      {
        path: "/profile",
        name: "profile",
        component: Profile,
        beforeEnter: createAuthGuard(app)
      },
      {
        path: "/tenant",
        name: "tenant",
        component: Tenant,
        beforeEnter: createAuthGuard(app)
      },
      {
        path: "/subject",
        name: "subject",
        component: Subject,
        beforeEnter: createAuthGuard(app)
      },
      {
        path: "/external-api",
        name: "external-api",
        component: ExternalApi,
        beforeEnter: createAuthGuard(app)
      }
    ],
    history: createWebHashHistory()
  })
}

