# IM功能集成说明

## 功能概述

成功将腾讯云IM（即时通讯）功能集成到深海圈网站，实现了用户之间的实时聊天功能。

## 核心功能

1. **用户搜索** - 支持按用户名或邮箱搜索其他用户
2. **实时聊天** - 支持一对一私聊
3. **在线状态** - 实时显示用户在线/离线状态
4. **消息历史** - 自动保存聊天记录
5. **未读消息** - 显示未读消息数量

## 技术实现

### 数据库设计

```prisma
// 主要数据模型
- Conversation: 会话表
- ConversationParticipant: 会话参与者
- Message: 消息表
- MessageRead: 消息已读记录
- UserOnlineStatus: 用户在线状态
```

### API接口

- `/api/im/users/search` - 搜索用户
- `/api/im/conversations` - 创建/获取会话
- `/api/im/messages` - 发送/获取消息
- `/api/im/status` - 更新/获取在线状态

### 前端组件

- `UserChat` - 主聊天组件，管理聊天窗口
- `ChatWindow` - 单个聊天窗口组件

## 使用方式

1. 在课程页面右下角点击聊天按钮
2. 搜索想要聊天的用户
3. 点击用户开始聊天
4. 支持同时打开多个聊天窗口

## 配置信息

```env
# 腾讯云IM配置
TENCENT_IM_APPID=1600099766
TENCENT_IM_KEY=470a0ee1c277fc1421cdde6607211410aab45c2368ea04610ccbd91c73d7be51
NEXT_PUBLIC_IM_APPID=1600099766
```

## 注意事项

1. 需要运行数据库迁移：`npx prisma migrate deploy`
2. 用户登录后自动更新在线状态
3. 聊天记录永久保存在数据库中