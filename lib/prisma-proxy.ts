// 本地开发用的Prisma代理客户端
// 通过HTTP请求访问服务器的数据库

const API_KEY = 'your-secure-key-2025'
const PROXY_URL = process.env.NODE_ENV === 'development' 
  ? 'http://111.231.19.162:3000/api/db-proxy'
  : '/api/db-proxy'

class PrismaProxy {
  constructor(private model: string) {}

  private async request(method: string, args?: any) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: this.model,
        method,
        args
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Proxy request failed')
    }

    const result = await response.json()
    return result.data
  }

  // 实现常用的Prisma方法
  findMany(args?: any) {
    return this.request('findMany', args)
  }

  findFirst(args?: any) {
    return this.request('findFirst', args)
  }

  findUnique(args: any) {
    return this.request('findUnique', args)
  }

  create(args: any) {
    return this.request('create', args)
  }

  update(args: any) {
    return this.request('update', args)
  }

  delete(args: any) {
    return this.request('delete', args)
  }

  deleteMany(args?: any) {
    return this.request('deleteMany', args)
  }

  count(args?: any) {
    return this.request('count', args)
  }

  updateMany(args: any) {
    return this.request('updateMany', args)
  }
}

// 创建代理客户端
export const prismaProxy = {
  user: new PrismaProxy('user'),
  post: new PrismaProxy('post'),
  comment: new PrismaProxy('comment'),
  course: new PrismaProxy('course'),
  chapter: new PrismaProxy('chapter'),
  enrollment: new PrismaProxy('enrollment'),
  progress: new PrismaProxy('progress'),
  event: new PrismaProxy('event'),
  eventParticipant: new PrismaProxy('eventParticipant'),
  message: new PrismaProxy('message'),
  notification: new PrismaProxy('notification'),
  article: new PrismaProxy('article'),
  announcement: new PrismaProxy('announcement')
}

// 健康检查
export async function checkProxyHealth() {
  try {
    const response = await fetch(`${PROXY_URL}`, {
      method: 'GET'
    })
    return response.ok
  } catch {
    return false
  }
}