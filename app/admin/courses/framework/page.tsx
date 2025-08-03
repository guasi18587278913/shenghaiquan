'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Video, FileText, ChevronDown, ChevronRight, Upload } from 'lucide-react';

interface Lesson {
  title: string;
  type: 'TEXT_ONLY' | 'VIDEO_TEXT';
  vodId?: string;
  duration?: number;
  order: number;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  title: string;
  slug: string;
  description: string;
  chapters: Chapter[];
}

interface Section {
  title: string;
  slug: string;
  description: string;
  courses: Course[];
}

export default function CourseFrameworkPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // 示例模板
  const exampleTemplate = `前言
├── 了解课程体系，制定学习计划
│   ├── 你要学什么？
│   ├── 技术成熟度到认知界点
│   └── 学习方法

基础篇
├── 快速上手AI工具，做出第一个产品
│   ├── 玩起来！10分钟发布你的产品【视频】
│   ├── 让AI帮你写代码
│   └── 部署到互联网

进阶篇
├── AI创业必备的产品知识
│   ├── 怎么做AI产品【视频】
│   ├── 产品设计方法论
│   └── 用户增长策略`;

  // 解析目录文本
  const parseOutline = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const result: Section[] = [];
    let currentSection: Section | null = null;
    let currentCourse: Course | null = null;
    let currentChapter: Chapter | null = null;
    let pendingLessons: Lesson[] = []; // 用于收集直接在章节下的课时

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const isVideo = trimmed.includes('【视频】') || trimmed.includes('[视频]');
      const cleanTitle = trimmed.replace(/【视频】|\[视频\]/g, '').trim();

      // 判断层级
      if (!line.startsWith(' ') && !line.startsWith('│') && !line.startsWith('├') && !line.startsWith('└')) {
        // 章节级别
        // 如果有待处理的课时，将每个课时作为独立的课程
        if (currentSection && pendingLessons.length > 0) {
          pendingLessons.forEach((lesson, idx) => {
            const course = {
              title: lesson.title,
              slug: generateSlug(lesson.title),
              description: '',
              chapters: [{
                title: '内容',
                lessons: [lesson],
                order: 1
              }]
            };
            currentSection.courses.push(course);
          });
          pendingLessons = [];
        }

        currentSection = {
          title: cleanTitle,
          slug: generateSlug(cleanTitle),
          description: '',
          courses: []
        };
        result.push(currentSection);
        currentCourse = null;
        currentChapter = null;
      } else if (line.startsWith('├── ') || line.startsWith('└── ')) {
        // 课程或课时级别
        if (currentSection) {
          // 检查下一行是否有子项（用于判断是否是课程）
          const hasSubItems = index < lines.length - 1 && 
            (lines[index + 1].startsWith('│   ├') || lines[index + 1].startsWith('│   └'));
          
          if (hasSubItems) {
            // 如果有待处理的课时，先处理它们
            if (pendingLessons.length > 0) {
              pendingLessons.forEach((lesson, idx) => {
                const course = {
                  title: lesson.title,
                  slug: generateSlug(lesson.title),
                  description: '',
                  chapters: [{
                    title: '内容',
                    lessons: [lesson],
                    order: 1
                  }]
                };
                currentSection.courses.push(course);
              });
              pendingLessons = [];
            }

            // 这是课程标题（有子项）
            currentCourse = {
              title: cleanTitle,
              slug: generateSlug(cleanTitle),
              description: '',
              chapters: []
            };
            currentSection.courses.push(currentCourse);
            currentChapter = {
              title: '第1章',
              lessons: [],
              order: 1
            };
            currentCourse.chapters.push(currentChapter);
          } else {
            // 这是直接在章节下的课时（如前言和认知篇）
            pendingLessons.push({
              title: cleanTitle,
              type: isVideo ? 'VIDEO_TEXT' : 'TEXT_ONLY',
              order: pendingLessons.length + 1
            });
          }
        }
      } else if (line.startsWith('│   ├') || line.startsWith('│   └')) {
        // 课时级别
        if (currentChapter) {
          currentChapter.lessons.push({
            title: cleanTitle,
            type: isVideo ? 'VIDEO_TEXT' : 'TEXT_ONLY',
            order: currentChapter.lessons.length + 1
          });
        }
      }
    });

    // 处理最后的待处理课时
    if (currentSection && pendingLessons.length > 0) {
      pendingLessons.forEach((lesson, idx) => {
        const course = {
          title: lesson.title,
          slug: generateSlug(lesson.title),
          description: '',
          chapters: [{
            title: '内容',
            lessons: [lesson],
            order: 1
          }]
        };
        currentSection.courses.push(course);
      });
    }

    return result;
  };

  // 生成URL slug
  const generateSlug = (title: string) => {
    const slugMap: { [key: string]: string } = {
      '前言': 'preface',
      '基础篇': 'basic',
      '进阶篇': 'advanced',
      '内功篇': 'skills',
      '认知篇': 'cognition'
    };
    
    return slugMap[title] || title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // 导入目录
  const handleImportOutline = () => {
    const input = (document.getElementById('outline-input') as HTMLTextAreaElement).value;
    if (!input.trim()) {
      alert('请输入课程目录');
      return;
    }
    
    const parsed = parseOutline(input);
    setSections(parsed);
    
    // 展开所有章节
    const allSectionIds = parsed.map((_, i) => `section-${i}`);
    setExpandedSections(new Set(allSectionIds));
  };

  // 保存到数据库
  const handleSaveAll = async () => {
    if (sections.length === 0) {
      alert('请先导入课程目录');
      return;
    }

    setSaving(true);
    
    try {
      for (const section of sections) {
        // 创建章节
        const sectionResponse = await fetch('/api/admin/courses/framework/section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(section)
        });

        if (!sectionResponse.ok) {
          throw new Error(`创建章节 ${section.title} 失败`);
        }
      }

      alert('课程框架创建成功！');
      router.push('/admin/courses');
    } catch (error) {
      alert('保存失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  // 切换展开/收起
  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCourse = (id: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCourses(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">批量创建课程框架</h1>
          
          {/* 导入区域 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">第一步：粘贴课程目录</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">格式示例：</p>
              <pre className="text-xs text-gray-500 whitespace-pre-wrap">{exampleTemplate}</pre>
            </div>
            
            <textarea
              id="outline-input"
              placeholder="在这里粘贴你的课程目录..."
              className="w-full h-64 p-4 border rounded-lg font-mono text-sm"
              defaultValue=""
            />
            
            <button
              onClick={handleImportOutline}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              解析目录
            </button>
          </div>

          {/* 预览区域 */}
          {sections.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">第二步：预览课程结构</h2>
              <div className="space-y-4">
                {sections.map((section, sIndex) => (
                  <div key={sIndex} className="border rounded-lg">
                    <div 
                      className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(`section-${sIndex}`)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedSections.has(`section-${sIndex}`) ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                        <h3 className="font-semibold">{section.title}</h3>
                        <span className="text-sm text-gray-500">({section.slug})</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {section.courses.length} 个课程
                      </span>
                    </div>
                    
                    {expandedSections.has(`section-${sIndex}`) && (
                      <div className="p-4 space-y-3">
                        {section.courses.map((course, cIndex) => (
                          <div key={cIndex} className="ml-4 border-l-2 border-gray-200 pl-4">
                            <div 
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => toggleCourse(`course-${sIndex}-${cIndex}`)}
                            >
                              {expandedCourses.has(`course-${sIndex}-${cIndex}`) ? 
                                <ChevronDown className="w-4 h-4" /> : 
                                <ChevronRight className="w-4 h-4" />
                              }
                              <h4 className="font-medium">{course.title}</h4>
                              <span className="text-xs text-gray-500">({course.slug})</span>
                            </div>
                            
                            {expandedCourses.has(`course-${sIndex}-${cIndex}`) && (
                              <div className="mt-2 ml-6 space-y-1">
                                {course.chapters.map((chapter, chIndex) => (
                                  <div key={chIndex}>
                                    <p className="text-sm font-medium text-gray-700">{chapter.title}</p>
                                    {chapter.lessons.map((lesson, lIndex) => (
                                      <div key={lIndex} className="ml-4 flex items-center gap-2 text-sm text-gray-600">
                                        {lesson.type === 'VIDEO_TEXT' ? 
                                          <Video className="w-3 h-3" /> : 
                                          <FileText className="w-3 h-3" />
                                        }
                                        <span>{lesson.title}</span>
                                        {lesson.type === 'VIDEO_TEXT' && (
                                          <span className="text-xs text-blue-600">[视频]</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 统计信息 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">统计信息</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">{sections.length}</span> 个章节
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">
                      {sections.reduce((acc, s) => acc + s.courses.length, 0)}
                    </span> 个课程
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">
                      {sections.reduce((acc, s) => 
                        acc + s.courses.reduce((cAcc, c) => 
                          cAcc + c.chapters.reduce((chAcc, ch) => 
                            chAcc + ch.lessons.length, 0
                          ), 0
                        ), 0
                      )}
                    </span> 个课时
                  </div>
                </div>
              </div>

              {/* 保存按钮 */}
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? '正在创建框架...' : '创建课程框架'}
              </button>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-3">使用说明</h2>
            <ol className="list-decimal list-inside space-y-2 text-yellow-800">
              <li>按照示例格式整理你的课程目录</li>
              <li>使用缩进表示层级关系（章节 → 课程 → 课时）</li>
              <li>在视频课时后面加上【视频】标记</li>
              <li>点击"解析目录"查看结构预览</li>
              <li>确认无误后点击"创建课程框架"</li>
              <li>框架创建后，可以逐步填充具体内容和视频ID</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}