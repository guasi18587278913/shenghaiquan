// Database proxy client for accessing remote database
interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const DB_PROXY_URL = process.env.DB_PROXY_URL || 'http://111.231.19.162:3000/api/db-proxy';
const DB_PROXY_KEY = process.env.DB_PROXY_KEY || 'your-secure-key-2025';

export async function queryViaProxy(sql: string, params?: any[]): Promise<any> {
  try {
    const response = await fetch(DB_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DB_PROXY_KEY,
      },
      body: JSON.stringify({
        query: sql,
        params: params || []
      }),
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
    }

    const result: ProxyResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Proxy query failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Proxy query error:', error);
    throw error;
  }
}

// Get course sections with courses
export async function getCourseSectionsViaProxy() {
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
  
  return await queryViaProxy(sql);
}

// Get course with chapters and lessons
export async function getCourseWithContentViaProxy(sectionSlug: string, courseSlug: string) {
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
  
  const courses = await queryViaProxy(courseSql, [sectionSlug, courseSlug]);
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
  
  const chapters = await queryViaProxy(chaptersSql, [course.id]);
  
  return {
    ...course,
    chapters
  };
}