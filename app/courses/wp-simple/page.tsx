'use client';

import { useState, useEffect } from 'react';

export default function SimpleWPPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://111.231.19.162/index.php?rest_route=/wp/v2/posts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">加载中...</div>;
  if (error) return <div className="p-8 text-red-500">错误: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">WordPress 文章</h1>
      {posts.length === 0 ? (
        <p>没有找到文章</p>
      ) : (
        <ul className="space-y-4">
          {posts.map(post => (
            <li key={post.id} className="border p-4 rounded">
              <h2 className="font-bold" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              <p className="text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}