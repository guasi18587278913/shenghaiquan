export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">测试页面</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">样式测试</h2>
          <p className="text-gray-600 mb-4">如果你能看到这个页面的样式（白色背景、圆角、阴影），说明 Tailwind CSS 正常工作。</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded">蓝色</div>
            <div className="bg-green-500 text-white p-4 rounded">绿色</div>
            <div className="bg-red-500 text-white p-4 rounded">红色</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">链接测试</h2>
          <ul className="space-y-2">
            <li>
              <a href="/login" className="text-blue-600 hover:underline">
                → 登录页面
              </a>
            </li>
            <li>
              <a href="/admin/courses" className="text-blue-600 hover:underline">
                → 课程管理（需要登录）
              </a>
            </li>
            <li>
              <a href="/admin/courses/import-feishu" className="text-blue-600 hover:underline">
                → 飞书导入（需要登录）
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}