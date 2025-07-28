-- 深海圈课程系统数据库迁移SQL
-- 在宝塔面板的PostgreSQL管理中执行此SQL

-- 1. 创建课程篇章表
CREATE TABLE IF NOT EXISTS "CourseSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "requiredTier" TEXT NOT NULL DEFAULT 'FREE',
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id"),
    UNIQUE ("slug")
);

-- 2. 删除旧的Course表（如果存在）
DROP TABLE IF EXISTS "Course" CASCADE;

-- 3. 创建新的课程表
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id"),
    UNIQUE ("slug"),
    FOREIGN KEY ("sectionId") REFERENCES "CourseSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. 删除旧的Chapter表（如果存在）
DROP TABLE IF EXISTS "Chapter" CASCADE;

-- 5. 创建新的章节表
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id"),
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. 创建课时表
CREATE TABLE IF NOT EXISTS "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "chapterId" TEXT NOT NULL,
    "content" TEXT,
    "videoId" TEXT,
    "videoDuration" INTEGER NOT NULL DEFAULT 0,
    "attachments" TEXT,
    "codeExamples" TEXT,
    "homework" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id"),
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. 创建直播回放表
CREATE TABLE IF NOT EXISTS "LiveReplay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "videoDuration" INTEGER NOT NULL,
    "liveDate" TIMESTAMP(3) NOT NULL,
    "presenter" TEXT NOT NULL,
    "attachments" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id")
);

-- 8. 创建课时笔记表
CREATE TABLE IF NOT EXISTS "LessonNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "timestamp" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id"),
    UNIQUE ("userId", "lessonId"),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. 删除旧的Progress表（如果存在）
DROP TABLE IF EXISTS "Progress" CASCADE;

-- 10. 创建新的学习进度表
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "watchTime" INTEGER NOT NULL DEFAULT 0,
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    PRIMARY KEY ("id"),
    UNIQUE ("userId", "lessonId"),
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11. 创建触发器自动更新updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建触发器
CREATE TRIGGER update_CourseSection_updated_at BEFORE UPDATE ON "CourseSection" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Course_updated_at BEFORE UPDATE ON "Course" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Chapter_updated_at BEFORE UPDATE ON "Chapter" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Lesson_updated_at BEFORE UPDATE ON "Lesson" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_LiveReplay_updated_at BEFORE UPDATE ON "LiveReplay" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_LessonNote_updated_at BEFORE UPDATE ON "LessonNote" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_Progress_updated_at BEFORE UPDATE ON "Progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();