import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    avatar?: string | null
  }

  interface Session {
    user: {
      id: string
      role: string
      phone?: string | null
      email?: string | null
      name?: string | null
      image?: string | null
      avatar?: string | null
    }
  }
}