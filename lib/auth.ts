import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// 导入验证码验证函数
import { verifyCode } from './auth/verification';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          image: user.avatar,
          avatar: user.avatar,
          role: user.role,
        }
      },
    }),
    // 手机验证码登录
    CredentialsProvider({
      id: "phone",
      name: "phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

        // 验证验证码
        const isValid = verifyCode(credentials.phone, credentials.code)
        if (!isValid) {
          return null
        }

        // 查找或创建用户
        let user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone,
          },
        })

        // 如果用户不存在，自动创建新用户
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              email: `${credentials.phone}@phone.user`,
              name: `用户${credentials.phone.slice(-4)}`,
              role: 'USER',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.phone}`,
            },
          })
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          image: user.avatar,
          avatar: user.avatar,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatar = token.avatar as string
      }
      return session
    },
  },
}