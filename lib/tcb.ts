import cloudbase from '@cloudbase/js-sdk';

// 初始化 CloudBase
let app: any = null;
let auth: any = null;
let db: any = null;

export async function initCloudBase() {
  if (!app) {
    app = cloudbase.init({
      env: process.env.NEXT_PUBLIC_TCB_ENV_ID!,
    });
    
    auth = app.auth();
    
    // 匿名登录
    const loginState = await auth.getLoginState();
    if (!loginState) {
      await auth.anonymousAuthProvider().signIn();
    }
    
    db = app.database();
  }
  
  return { app, auth, db };
}

// 获取数据库实例
export async function getDB() {
  if (!db) {
    await initCloudBase();
  }
  return db;
}

// 课程相关操作
export const courseService = {
  // 获取所有课程
  async getAllCourses() {
    const db = await getDB();
    const { data } = await db
      .collection('courses')
      .where({
        isPublished: true
      })
      .orderBy('createdAt', 'desc')
      .get();
    
    return data;
  },

  // 获取单个课程详情
  async getCourseBySlug(slug: string) {
    const db = await getDB();
    
    // 获取课程
    const { data: courses } = await db
      .collection('courses')
      .where({ slug, isPublished: true })
      .limit(1)
      .get();
    
    if (!courses || courses.length === 0) {
      return null;
    }
    
    const course = courses[0];
    
    // 获取章节
    const { data: sections } = await db
      .collection('sections')
      .where({ courseId: course._id })
      .orderBy('order', 'asc')
      .get();
    
    // 获取每个章节的课时
    for (const section of sections) {
      const { data: lessons } = await db
        .collection('lessons')
        .where({ sectionId: section._id })
        .orderBy('order', 'asc')
        .get();
      section.lessons = lessons;
    }
    
    return {
      ...course,
      sections
    };
  },

  // 获取免费课时
  async getFreeLessons() {
    const db = await getDB();
    const { data } = await db
      .collection('lessons')
      .where({
        isFree: true
      })
      .limit(10)
      .get();
    
    return data;
  }
};