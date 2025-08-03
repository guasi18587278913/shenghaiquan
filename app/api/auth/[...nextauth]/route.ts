import NextAuth from "next-auth"

// 临时使用不依赖Prisma的配置
let authOptions;
try {
  // 尝试加载原始配置
  authOptions = require("@/lib/auth").authOptions;
} catch (error) {
  // 如果失败，使用临时配置
  authOptions = require("@/lib/auth-temp").authOptions;
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }