<?php
// GitHub Webhook 接收端点
$webhook_secret = 'deepsea-deploy-2025';

// 获取请求体
$payload = file_get_contents('php://input');
$headers = getallheaders();

// 验证签名
if (isset($headers['X-Hub-Signature-256'])) {
    $signature = 'sha256=' . hash_hmac('sha256', $payload, $webhook_secret);
    if (!hash_equals($signature, $headers['X-Hub-Signature-256'])) {
        http_response_code(401);
        die('Invalid signature');
    }
}

// 解析JSON
$data = json_decode($payload, true);

// 只处理push到main分支的事件
if ($data && isset($data['ref']) && $data['ref'] === 'refs/heads/main') {
    // 执行部署脚本
    $output = shell_exec('/www/wwwroot/deepsea/deploy-webhook.sh 2>&1');
    
    // 记录日志
    file_put_contents('/www/wwwroot/webhook-trigger.log', 
        date('Y-m-d H:M:s') . " - Webhook triggered\n" . $output . "\n", 
        FILE_APPEND
    );
    
    echo 'Deployment triggered';
} else {
    echo 'Not a main branch push';
}
?>