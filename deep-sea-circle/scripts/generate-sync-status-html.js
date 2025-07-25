const fs = require('fs')

// 读取检查报告
const report = JSON.parse(fs.readFileSync('data-sync-report.json', 'utf-8'))

// 生成HTML报告
const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>深海圈数据同步状态报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            color: #0891A1;
            border-bottom: 3px solid #0891A1;
            padding-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border: 1px solid #e9ecef;
        }
        .card h3 {
            margin: 0;
            color: #666;
            font-size: 14px;
            font-weight: normal;
        }
        .card .number {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .card.good { border-left: 5px solid #22c55e; }
        .card.warning { border-left: 5px solid #f59e0b; }
        .card.error { border-left: 5px solid #ef4444; }
        .progress {
            background: #e9ecef;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            background: #0891A1;
            height: 100%;
            transition: width 0.3s;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        th {
            background: #f8f9fa;
            font-weight: bold;
        }
        .status-ok { color: #22c55e; }
        .status-error { color: #ef4444; }
        .section {
            margin: 40px 0;
        }
        .mismatch {
            background: #fef3c7;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
        }
        .chart {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
        }
        .chart-item {
            flex: 1;
            min-width: 300px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 深海圈数据同步状态报告</h1>
        <p style="color: #666;">生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
        
        <div class="summary">
            <div class="card good">
                <h3>CSV用户总数</h3>
                <div class="number">${report.summary.csvTotal}</div>
            </div>
            <div class="card good">
                <h3>数据库用户总数</h3>
                <div class="number">${report.summary.dbTotal}</div>
            </div>
            <div class="card ${report.summary.matched > 890 ? 'good' : 'warning'}">
                <h3>成功匹配</h3>
                <div class="number">${report.summary.matched}</div>
                <small>${((report.summary.matched / report.summary.csvTotal) * 100).toFixed(1)}%</small>
            </div>
            <div class="card ${report.summary.notInDb > 10 ? 'error' : 'warning'}">
                <h3>未导入用户</h3>
                <div class="number">${report.summary.notInDb}</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 数据同步进度</h2>
            <div class="progress">
                <div class="progress-bar" style="width: ${(report.summary.matched / report.summary.csvTotal * 100)}%"></div>
            </div>
            <p style="text-align: center; color: #666;">
                已同步 ${report.summary.matched} / ${report.summary.csvTotal} (${((report.summary.matched / report.summary.csvTotal) * 100).toFixed(1)}%)
            </p>
        </div>

        <div class="section">
            <h2>📍 字段匹配情况</h2>
            <table>
                <tr>
                    <th>字段</th>
                    <th>匹配数</th>
                    <th>不匹配数</th>
                    <th>匹配率</th>
                    <th>状态</th>
                </tr>
                ${Object.entries(report.fieldMatches).map(([field, stats]) => {
                    const rate = (stats.matched / (stats.matched + stats.mismatched) * 100).toFixed(1);
                    const status = rate > 90 ? 'ok' : 'error';
                    return `
                    <tr>
                        <td>${field === 'location' ? '位置' : field === 'company' ? '公司/行业' : field === 'position' ? '职位/身份' : '头像'}</td>
                        <td>${stats.matched}</td>
                        <td>${stats.mismatched}</td>
                        <td>${rate}%</td>
                        <td class="status-${status}">${rate > 90 ? '✅ 良好' : '⚠️ 需要检查'}</td>
                    </tr>
                    `;
                }).join('')}
            </table>
        </div>

        <div class="section chart">
            <div class="chart-item">
                <h3>🏙️ CSV城市分布 Top 10</h3>
                <table>
                    ${report.cityDistribution.topCsvCities.map(([city, count]) => `
                    <tr>
                        <td>${city}</td>
                        <td style="text-align: right;">${count}人</td>
                    </tr>
                    `).join('')}
                </table>
            </div>
            <div class="chart-item">
                <h3>💾 数据库城市分布 Top 10</h3>
                <table>
                    ${report.cityDistribution.topDbCities.map(([city, count]) => `
                    <tr>
                        <td>${city}</td>
                        <td style="text-align: right;">${count}人</td>
                    </tr>
                    `).join('')}
                </table>
            </div>
        </div>

        <div class="section">
            <h2>🌐 API接口状态</h2>
            <table>
                <tr>
                    <th>接口</th>
                    <th>状态</th>
                    <th>备注</th>
                </tr>
                ${report.apiTests.map(test => `
                <tr>
                    <td>${test.endpoint}</td>
                    <td>${test.status}</td>
                    <td>${test.error || test.locationCount || test.userCount || '-'}</td>
                </tr>
                `).join('')}
            </table>
        </div>

        ${report.mismatches.length > 0 ? `
        <div class="section">
            <h2>⚠️ 数据不匹配示例</h2>
            ${report.mismatches.slice(0, 10).map(m => `
            <div class="mismatch">
                <strong>${m.name}</strong>: 
                CSV="${m.csv}" → 提取="${m.csvExtracted}", 
                数据库="${m.db}"
            </div>
            `).join('')}
        </div>
        ` : ''}

        ${report.notInDb.length > 0 ? `
        <div class="section">
            <h2>❌ 未导入的用户</h2>
            <p>以下用户在CSV中存在，但未导入数据库：</p>
            <ul>
                ${report.notInDb.map(name => `<li>${name}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="section">
            <h2>💡 建议操作</h2>
            <ol>
                ${report.summary.notInDb > 0 ? '<li>导入缺失的用户数据</li>' : ''}
                ${report.fieldMatches.location.mismatched > 50 ? '<li>运行位置数据修复脚本</li>' : ''}
                ${report.summary.extraInDb > 20 ? '<li>清理测试数据</li>' : ''}
                <li>定期运行数据同步检查</li>
                <li>建立数据质量监控机制</li>
            </ol>
        </div>
    </div>
</body>
</html>
`

// 保存HTML文件
fs.writeFileSync('data-sync-status.html', html, 'utf-8')
console.log('✅ 数据同步状态报告已生成: data-sync-status.html')
console.log('📌 使用浏览器打开查看详细的可视化报告')