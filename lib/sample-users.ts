// 示例用户数据，用于演示
export const sampleUsers = [
  {
    id: "1",
    name: "刘小排",
    image: "/avatars/刘小排.jpg",
    verified: true,
  },
  {
    id: "2", 
    name: "张三",
    image: "/avatars/user2.jpg",
  },
  {
    id: "3",
    name: "李四",
    image: "/avatars/user3.jpg",
  },
  {
    id: "4",
    name: "王五",
    image: "/avatars/user4.jpg",
  },
  {
    id: "5",
    name: "赵六",
    image: "/avatars/user5.jpg",
  },
]

// 获取随机用户
export function getRandomUser() {
  return sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
}

// 根据用户名获取用户
export function getUserByName(name: string) {
  // 为特定用户映射到对应的卡通风格头像（复用现有的卡通头像）
  const userAvatarMap: { [key: string]: string } = {
    "周大学生": "/avatars/user2.jpg",  // 使用张三的卡通风格
    "吴自由": "/avatars/user3.jpg",    // 使用李四的卡通风格
    "王工程师": "/avatars/user4.jpg",  // 使用王五的卡通风格
    "王助教": "/avatars/user5.jpg",    // 使用赵六的卡通风格
    "李晓华": "/avatars/user2.jpg",    // 复用卡通风格
    "郑老师": "/avatars/user3.jpg",    // 复用卡通风格
    "陈创业": "/avatars/user4.jpg"     // 复用卡通风格
  }
  
  const user = sampleUsers.find(user => user.name === name)
  if (user) return user
  
  return {
    name,
    image: userAvatarMap[name] || "/avatars/default-user.jpg",
    verified: false,
  }
}