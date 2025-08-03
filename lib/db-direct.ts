// Direct database access without Prisma
import { Pool } from 'pg';
import { queryViaProxy, getCourseSectionsViaProxy, getCourseWithContentViaProxy } from './db-proxy-client';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Since we're using SSH tunnel
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper to query the database with proxy fallback
export async function query(sql: string, params?: any[]) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.log('Direct database connection failed');
    // 暂时禁用proxy，避免认证错误
    throw error;
  }
}

// Get course sections with courses
export async function getCourseSections() {
  try {
    const sql = `
      SELECT 
        cs.id,
        cs.title,
        cs.slug,
        cs.description,
        cs.order,
        cs.icon,
        cs.color,
        COUNT(c.id) as course_count
      FROM "CourseSection" cs
      LEFT JOIN "Course" c ON c."sectionId" = cs.id
      GROUP BY cs.id
      ORDER BY cs.order
    `;
    
    return await query(sql);
  } catch (error) {
    console.log('Database error, returning empty array');
    // 返回空数组，让API回退到静态数据
    return [];
  }
}

// Get courses by section
export async function getCoursesBySection(sectionSlug: string) {
  const sql = `
    SELECT 
      c.id,
      c.title,
      c.slug,
      c.description,
      c.order,
      c."totalDuration",
      c."totalLessons"
    FROM "Course" c
    JOIN "CourseSection" cs ON c."sectionId" = cs.id
    WHERE cs.slug = $1
    ORDER BY c.order
  `;
  
  return await query(sql, [sectionSlug]);
}

// Get course with chapters and lessons
export async function getCourseWithContent(sectionSlug: string, courseSlug: string) {
  try {
    // First get the course
    const courseSql = `
      SELECT 
        c.id,
        c.title,
        c.slug,
        c.description,
        cs.title as section_title,
        cs.slug as section_slug
      FROM "Course" c
      JOIN "CourseSection" cs ON c."sectionId" = cs.id
      WHERE cs.slug = $1 AND c.slug = $2
      LIMIT 1
    `;
    
    const courses = await query(courseSql, [sectionSlug, courseSlug]);
    if (!courses || courses.length === 0) return null;
    
    const course = courses[0];
    
    // Get chapters with lessons
    const chaptersSql = `
      SELECT 
        ch.id,
        ch.title,
        ch.description,
        ch.order,
        json_agg(
          json_build_object(
            'id', l.id,
            'title', l.title,
            'description', l.description,
            'type', l.type,
            'order', l.order,
            'content', l.content,
            'videoId', l."videoId",
            'videoDuration', l."videoDuration",
            'isFree', l."isFree"
          ) ORDER BY l.order
        ) as lessons
      FROM "Chapter" ch
      LEFT JOIN "Lesson" l ON l."chapterId" = ch.id
      WHERE ch."courseId" = $1
      GROUP BY ch.id
      ORDER BY ch.order
    `;
    
    const chapters = await query(chaptersSql, [course.id]);
    
    return {
      ...course,
      chapters
    };
  } catch (error) {
    console.log('Database error, returning null to use static data');
    // 返回null，让页面使用静态数据
    return null;
  }
}

// Get lesson content
export async function getLesson(lessonId: string) {
  const sql = `
    SELECT 
      l.*,
      ch.title as chapter_title,
      c.title as course_title,
      c.slug as course_slug,
      cs.slug as section_slug
    FROM "Lesson" l
    JOIN "Chapter" ch ON l."chapterId" = ch.id
    JOIN "Course" c ON ch."courseId" = c.id
    JOIN "CourseSection" cs ON c."sectionId" = cs.id
    WHERE l.id = $1
    LIMIT 1
  `;
  
  const lessons = await query(sql, [lessonId]);
  return lessons[0] || null;
}

// Close the pool when needed
export async function closePool() {
  await pool.end();
}