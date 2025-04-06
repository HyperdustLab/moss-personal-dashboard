import { createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import useI18n from '@/lang/index'

const lang = localStorage.getItem('lang') || 'en-us'

const Layouts = () => import('@/layouts/index.vue')

const { t } = useI18n.global

/** 常驻路由 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layouts,
    meta: {
      hidden: true,
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/invite/:walletAddress',
    component: () => import('@/views/dashboard/invite.vue'),
    name: 'invite',
    meta: {
      hidden: true,
      name: 'invite',
    },
  },

  {
    path: '/goInvite',
    component: () => import('@/views/dashboard/goInvite.vue'),
    name: 'goInvite',
    meta: {
      hidden: true,
      name: 'goInvite',
    },
  },

  {
    path: '/inviteSuccess/:walletAddress',
    component: () => import('@/views/dashboard/inviteSuccess.vue'),
    name: 'inviteSuccess',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/goShare',
    component: () => import('@/views/share/index.vue'),
    name: 'goShare',
    meta: {
      hidden: true,
    },
  },

  {
    path: '/',
    component: Layouts,
    redirect: 'POPAgent',
    meta: {
      title: 'POP Agent',
      keepAlive: true,
      svgIcon: 'NftTransactionRecord',
    },

    children: [
      {
        path: 'POPAgent',
        component: () => import('@/views/POPAgent/index.vue'),
        name: 'POPAgent',
        meta: {
          title: 'POP Agent',
          keepAlive: true,
        },
      },

      {
        path: 'agentReward',
        component: () => import('@/views/agentReward/index.vue'),
        name: 'agentReward',
        meta: {
          title: 'Agent Reward',
          keepAlive: true,
        },
      },

      {
        path: '/agentBaserewardReleaseRecord/index',
        component: () => import('@/views/agentBaserewardReleaseRecord/index.vue'),
        name: 'AgentBaserewardReleaseRecord',
        meta: {
          title: 'Reward Claim',
          keepAlive: true,
        },
      },
    ],
  },
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/permission',
    component: Layouts,
    redirect: '/permission/page',
    name: 'Permission',
    meta: {
      title: '权限管理',
      svgIcon: 'lock',
      roles: ['admin', 'editor'], // 可以在根路由中设置角色
      alwaysShow: true, // 将始终显示根菜单
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page.vue'),
        name: 'PagePermission',
        meta: {
          title: '页面权限',
          roles: ['admin'], // 或者在子导航中设置角色
        },
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive.vue'),
        name: 'DirectivePermission',
        meta: {
          title: '指令权限', // 如果未设置角色，则表示：该页面不需要权限，但会继承根路由的角色
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*', // Must put the 'ErrorPage' route at the end, 必须将 'ErrorPage' 路由放在最后
    redirect: '/404',
    name: 'ErrorPage',
    meta: {
      hidden: true,
    },
  },
]

const router = createRouter({
  history: import.meta.env.VITE_ROUTER_HISTORY === 'hash' ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH) : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: constantRoutes,
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach(route => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
