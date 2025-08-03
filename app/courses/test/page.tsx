export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">测试页面</h1>
        <p className="mt-4">如果能看到这个页面，说明 Next.js 正常工作</p>
        <a href="/courses/wp" className="text-blue-600 hover:underline mt-4 block">
          访问 WordPress 课程页面
        </a>
      </div>
    </div>
  );
}