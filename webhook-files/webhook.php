<?php
// GitHub Webhook 接收端点
// 设置密钥（稍后在GitHub中设置相同的密钥）
$webhook_secret = 'your-webhook-secret-2025';

// 获取请求体
$payload = file_get_contents('php://input');
$headers = getallheaders();

// 验证签名
if (!isset($headers['X-Hub-Signature-256'])) {
    http_response_code(401);
    die('Missing signature');
}

$signature = 'sha256=' . hash_hmac('sha256', $payload, $webhook_secret);
if (!hash_equals($signature, $headers['X-Hub-Signature-256'])) {
    http_response_code(401);
    die('Invalid signature');
}

// 解析JSON
$data = json_decode($payload, true);

// 只处理push到main分支的事件
if ($data['ref'] !== 'refs/heads/main') {
    die('Not main branch');
}

// 执行部署脚本
$output = shell_exec('/www/wwwroot/shenghaiquan/deploy-webhook.sh 2>&1');

// 记录日志
file_put_contents('/www/wwwroot/webhook.log', 
    date('Y-m-d H:M:s') . " - Webhook triggered\n" . $output . "\n", 
    FILE_APPEND
);

// 返回成功
http_response_code(200);
echo 'Deployment triggered';
?>