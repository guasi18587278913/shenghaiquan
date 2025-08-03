// WordPress内容迁移到私有存储脚本
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

// 配置
const WORDPRESS_API = 'http://111.231.19.162/index.php?rest_route=/wp/v2';
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

async function migrateWordPressContent() {
  console.log('🚀 开始从WordPress迁移内容...\n');
  
  try {
    // 1. 获取所有文章
    console.log('📥 获取WordPress文章列表...');
    const posts = await fetch(`${WORDPRESS_API}/posts?per_page=100`).then(r => r.json());
    console.log(`✅ 找到 ${posts.length} 篇文章\n`);
    
    for (const post of posts) {
      console.log(`\n处理文章: ${post.title.rendered}`);
      
      // 2. 提取文章内容和图片
      const content = post.content.rendered;
      const images = extractImages(content);
      
      console.log(`  - 找到 ${images.length} 张图片`);
      
      // 3. 下载并上传图片到私有COS
      const imageMapping = {};
      for (const imgUrl of images) {
        try {
          const fileName = path.basename(imgUrl);
          const imageData = await downloadImage(imgUrl);
          
          // 上传到私有存储
          const key = `courses/migrated/${post.slug}/images/${fileName}`;
          await cos.putObject({
            Bucket: process.env.COS_PRIVATE_BUCKET,
            Region: process.env.COS_REGION,
            Key: key,
            Body: imageData,
            ACL: 'private'
          });
          
          // 记录新旧URL映射
          imageMapping[imgUrl] = `/api/protected-content/migrated/${post.slug}/images/${fileName}`;
          console.log(`  ✅ 图片已迁移: ${fileName}`);
        } catch (err) {
          console.log(`  ❌ 图片迁移失败: ${imgUrl}`);
        }
      }
      
      // 4. 替换内容中的图片URL
      let protectedContent = content;
      for (const [oldUrl, newUrl] of Object.entries(imageMapping)) {
        protectedContent = protectedContent.replace(new RegExp(oldUrl, 'g'), newUrl);
      }
      
      // 5. 保存处理后的内容
      const contentKey = `courses/migrated/${post.slug}/content.html`;
      await cos.putObject({
        Bucket: process.env.COS_PRIVATE_BUCKET,
        Region: process.env.COS_REGION,
        Key: contentKey,
        Body: Buffer.from(protectedContent),
        ContentType: 'text/html',
        ACL: 'private'
      });
      
      console.log(`✅ 文章内容已保护存储`);
      
      // 6. 生成迁移报告
      const report = {
        wordpressId: post.id,
        title: post.title.rendered,
        slug: post.slug,
        originalUrl: post.link,
        protectedContentKey: contentKey,
        imagesCount: images.length,
        migratedAt: new Date().toISOString()
      };
      
      // 保存到数据库或文件
      fs.appendFileSync(
        'migration-report.json',
        JSON.stringify(report) + '\n'
      );
    }
    
    console.log('\n✅ 迁移完成！');
    console.log('📄 查看 migration-report.json 获取详细信息');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  }
}

// 提取HTML中的图片URL
function extractImages(html) {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const images = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  return images;
}

// 下载图片
async function downloadImage(url) {
  const response = await fetch(url);
  return await response.buffer();
}

// 运行迁移
migrateWordPressContent();