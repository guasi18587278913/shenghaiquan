# 测试自动部署功能

## 步骤1：检查webhook配置

在宝塔面板终端运行：

```bash
# 检查webhook.php文件
ls -la /www/wwwroot/webhook.php

# 检查部署脚本
ls -la /www/wwwroot/deepsea/deploy-webhook.sh

# 检查脚本权限
ls -la /www/wwwroot/deepsea/deploy-webhook.sh
```

## 步骤2：测试webhook日志

```bash
# 查看webhook日志
tail -f /www/wwwroot/webhook.log
```

## 步骤3：模拟webhook调用（在服务器上测试）

```bash
cd /www/wwwroot/deepsea
bash deploy-webhook.sh
```

## 步骤4：验证自动部署

1. 在本地修改一个文件（比如在首页添加测试文字）
2. 提交并推送到GitHub
3. 等待1-2分钟
4. 在宝塔面板查看webhook日志
5. 访问网站查看是否更新

## 步骤5：检查Git状态

在宝塔面板终端：

```bash
cd /www/wwwroot/deepsea
git status
git log --oneline -5
```

## 预期结果

- webhook.log 应该显示接收到GitHub的请求
- deploy-webhook.sh 应该自动执行
- 网站内容应该自动更新

## 故障排查

如果自动部署没有工作：

1. 检查GitHub webhook设置
2. 检查webhook.php路径是否正确
3. 检查deploy-webhook.sh权限
4. 查看PM2日志：`pm2 logs deepsea`