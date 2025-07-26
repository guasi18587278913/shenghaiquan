// 智能Prisma客户端选择器
// 本地开发时使用代理，生产环境使用直连

import { PrismaClient } from '@prisma/client'
import { prismaProxy } from './prisma-proxy'

// 检查是否需要使用代理
const shouldUseProxy = () => {
  // 本地开发且数据库URL指向远程时使用代理
  return process.env.NODE_ENV === 'development' && 
         process.env.DATABASE_URL?.includes('111.231.19.162')
}

// 创建或获取Prisma实例
let prismaInstance: PrismaClient | null = null

function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

// 导出智能客户端
export const prisma = shouldUseProxy() ? prismaProxy : getPrismaClient()

// 类型导出（保持兼容性）
export type { User, Post, Course, Chapter } from '@prisma/client'