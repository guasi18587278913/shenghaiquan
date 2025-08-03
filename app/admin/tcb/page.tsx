'use client';

import { useState, useEffect } from 'react';
import { initCloudBase } from '@/lib/tcb';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';

interface Course {
  _id?: string;
  title: string;
  description: string;
  slug: string;
  cover?: string;
  isPublished: boolean;
  createdAt?: Date;
}

interface Section {
  _id?: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  slug: string;
}

interface Lesson {
  _id?: string;
  sectionId: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  isFree: boolean;
  order: number;
}

export default function TCBAdminPage() {
  const [db, setDb] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // 初始化CloudBase
  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      const { db: database } = await initCloudBase();
      setDb(database);
      await loadCourses(database);
    } catch (error) {
      console.error('初始化失败:', error);
      alert('初始化CloudBase失败，请检查环境ID配置');
    }
  };

  // 加载课程列表
  const loadCourses = async (database: any) => {
    setLoading(true);
    try {
      const { data } = await database.collection('courses').get();
      setCourses(data || []);
    } catch (error) {
      console.error('加载课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加或更新课程
  const saveCourse = async () => {
    if (!editingCourse || !db) return;

    setLoading(true);
    try {
      if (editingCourse._id) {
        // 更新
        await db.collection('courses').doc(editingCourse._id).update({
          title: editingCourse.title,
          description: editingCourse.description,
          slug: editingCourse.slug,
          isPublished: editingCourse.isPublished,
          updatedAt: new Date()
        });
      } else {
        // 创建
        await db.collection('courses').add({
          ...editingCourse,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await loadCourses(db);
      setEditingCourse(null);
      alert('保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除课程
  const deleteCourse = async (courseId: string) => {
    if (!confirm('确定要删除这个课程吗？')) return;
    
    setLoading(true);
    try {
      await db.collection('courses').doc(courseId).remove();
      await loadCourses(db);
      alert('删除成功！');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载章节
  const loadSections = async (courseId: string) => {
    if (!db) return;
    
    try {
      const { data } = await db
        .collection('sections')
        .where({ courseId })
        .orderBy('order', 'asc')
        .get();
      setSections(data || []);
    } catch (error) {
      console.error('加载章节失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">CloudBase 课程管理</h1>
            <button
              onClick={() => setEditingCourse({
                title: '',
                description: '',
                slug: '',
                isPublished: false
              })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              添加课程
            </button>
          </div>

          {/* 环境信息 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>环境ID：</strong>{process.env.NEXT_PUBLIC_TCB_ENV_ID}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>状态：</strong>{db ? '已连接' : '未连接'}
            </p>
          </div>

          {/* 课程列表 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">/{course.slug}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {course.isPublished ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        loadSections(course._id!);
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      管理章节
                    </button>
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCourse(course._id!)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 编辑课程弹窗 */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingCourse._id ? '编辑课程' : '添加课程'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">课程标题</label>
                  <input
                    type="text"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例如：AI编程实战"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">课程描述</label>
                  <textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="简要描述课程内容"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL标识</label>
                  <input
                    type="text"
                    value={editingCourse.slug}
                    onChange={(e) => setEditingCourse({...editingCourse, slug: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="例如：ai-programming"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingCourse.isPublished}
                      onChange={(e) => setEditingCourse({...editingCourse, isPublished: e.target.checked})}
                    />
                    <span className="text-sm">立即发布</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={saveCourse}
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => setEditingCourse(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 章节管理 */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedCourse.title} - 章节管理
              </h2>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>章节管理功能开发中...</p>
              <p className="text-sm mt-2">你可以先在数据库中手动添加章节数据</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}