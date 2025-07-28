-- 修复 Lesson 表的 type 字段类型
-- 这个脚本将安全地更新字段类型，保留现有数据

-- 1. 查看当前 type 字段的值
SELECT DISTINCT type, COUNT(*) as count 
FROM "Lesson" 
GROUP BY type;

-- 2. 添加临时列
ALTER TABLE "Lesson" 
ADD COLUMN IF NOT EXISTS "type_new" "LessonType";

-- 3. 迁移数据（根据实际情况调整映射规则）
UPDATE "Lesson" 
SET "type_new" = 
  CASE 
    WHEN type = 'video' OR type = 'VIDEO' OR type LIKE '%video%' THEN 'VIDEO_TEXT'::“LessonType”
    WHEN type = 'text' OR type = 'TEXT' OR type IS NULL THEN 'TEXT_ONLY'::“LessonType”
    ELSE 'TEXT_ONLY'::“LessonType”
  END
WHERE "type_new" IS NULL;

-- 4. 删除旧列
ALTER TABLE "Lesson" DROP COLUMN "type";

-- 5. 重命名新列
ALTER TABLE "Lesson" RENAME COLUMN "type_new" TO "type";

-- 6. 设置非空约束
ALTER TABLE "Lesson" ALTER COLUMN "type" SET NOT NULL;

-- 7. 验证结果
SELECT type, COUNT(*) as count 
FROM "Lesson" 
GROUP BY type;