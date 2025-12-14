'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Eye, FileText } from 'lucide-react';
import { adminService } from '@/supabase/adminService';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost } from '@/types/content';

export default function AdminBlogsPage() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await adminService.getAllBlogs();
      setBlogs(data as BlogPost[]);
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blogs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete blog',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Blog Management</h1>
            <p className="text-slate-300">Create and manage blog posts for your website.</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <p className="text-slate-300">Create and manage blog posts for your website.</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No blog posts yet</h3>
            <p className="text-slate-400 mb-4">Get started by creating your first blog post.</p>
            <Link href="/admin/blogs/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-300">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-300">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">{blog.title}</p>
                        <p className="text-slate-400 text-sm truncate max-w-md">
                          {blog.excerpt || blog.slug}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {blog.is_published ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-sm">
                      {formatDate(blog.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {blog.is_published && (
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/blogs/${blog.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(blog.id, blog.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      {blogs.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <span>{blogs.length} total post{blogs.length !== 1 ? 's' : ''}</span>
          <span>{blogs.filter(b => b.is_published).length} published</span>
          <span>{blogs.filter(b => !b.is_published).length} draft{blogs.filter(b => !b.is_published).length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
