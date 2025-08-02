import type { User } from "@/lib/schema.ts";

/**
 * TODO 全局变量
 * 有些数据，比如登录的微信用户自己的用户数据不存在数据库中，
 * 因为控制器的函数是普通函数，不能通过访问 content 获取上层数据
 * 所以这里使用一个全局变量储存数据
 */

const _global = {
  enableDebug: true,
};

export default _global;
