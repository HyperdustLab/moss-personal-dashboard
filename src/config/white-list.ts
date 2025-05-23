import { type RouteLocationNormalized } from 'vue-router'

/** 免登录白名单（匹配路由 path） */
const whiteListByPath: string[] = ['/login', '/', '/goShare']

/** 免登录白名单（匹配路由 name） */
const whiteListByName: string[] = ['invite', 'inviteSuccess', 'share', 'goShare', 'goInvite']

/** 判断是否在白名单 */
const isWhiteList = (to: RouteLocationNormalized) => {
  console.info(whiteListByName.indexOf(to.name), to.name)
  // path 和 name 任意一个匹配上即可
  return whiteListByPath.indexOf(to.path) !== -1 || whiteListByName.indexOf(to.name as any) !== -1
}

export default isWhiteList
