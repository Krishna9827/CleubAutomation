'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye, ChevronDown, ChevronUp, Search, Trash2, Upload, X } from 'lucide-react';
import { adminService } from '@/supabase/adminService';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost } from '@/types/content';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'file'>('url');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content_markdown: '',
    cover_image_url: '',
    meta_title: '',
    meta_description: '',
    keywords: [],
    canonical_url: '',
    is_published: false,
    reading_time_minutes: 5
  });

  useEffect(() => {
    loadBlog();
  }, [blogId]);

  const loadBlog = async () => {
    try {
      const blog = await adminService.getBlogById(blogId);
      if (!blog) {
        toast({
          title: 'Error',
          description: 'Blog post not found',
          variant: 'destructive'
        });
        router.push('/admin/blogs');
        return;
      }
      setFormData(blog);
      if (blog.cover_image_url) {
        setImagePreview(blog.cover_image_url);
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploadedImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData(prev => ({ ...prev, cover_image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, cover_image_url: '' }));
  };

  const handleSubmit = async (publish?: boolean) => {
    if (!formData.title?.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const updateData: any = {
        ...formData,
        keywords: formData.keywords?.length ? formData.keywords : null
      };

      // If explicitly publishing/unpublishing
      if (publish !== undefined) {
        updateData.is_published = publish;
      }

      await adminService.updateBlog(blogId, updateData);
      
      toast({
        title: 'Success',
        description: 'Blog post updated successfully'
      });

      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update blog',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteBlog(blogId);
      toast({
        title: 'Success',
        description: 'Blog post deleted'
      });
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/blogs')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>
            <p className="text-slate-300">
              {formData.is_published ? 'Published' : 'Draft'} • Last updated {new Date(formData.updated_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          {formData.is_published ? (
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Title</Label>
                <Input
                  placeholder="Enter blog post title..."
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">/blog/</span>
                  <Input
                    placeholder="post-slug"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 space-y-2">
              <Label className="text-white">Excerpt</Label>
              <Textarea
                placeholder="Brief summary that appears on the blog list..."
                value={formData.excerpt || ''}
                onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Content (Markdown)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                placeholder="Write your blog post content in Markdown..."
                value={formData.content_markdown || ''}
                onChange={e => setFormData(prev => ({ ...prev, content_markdown: e.target.value }))}
                className="bg-white/10 border-white/20 text-white font-mono text-sm"
                rows={20}
              />
              <p className="text-xs text-slate-500">
                Supports Markdown formatting. Use # for headings, ** for bold, * for italic.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Method Selection */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={imageUploadMethod === 'url' ? 'default' : 'outline'}
                  onClick={() => setImageUploadMethod('url')}
                  className={imageUploadMethod === 'url' ? 'bg-amber-500 text-black' : 'border-white/20 text-white'}
                >
                  URL
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={imageUploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => setImageUploadMethod('file')}
                  className={imageUploadMethod === 'file' ? 'bg-amber-500 text-black' : 'border-white/20 text-white'}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>

              {/* URL Input */}
              {imageUploadMethod === 'url' && (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={formData.cover_image_url || ''}
                    onChange={e => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-slate-500">Enter the URL of your cover image</p>
                </div>
              )}

              {/* File Upload */}
              {imageUploadMethod === 'file' && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-amber-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <label
                      htmlFor="cover-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-slate-400" />
                      <p className="text-sm text-slate-300">Click to upload image</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                  {uploadedImage && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-300">{uploadedImage.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearImage}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {(formData.cover_image_url || imagePreview) && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Preview</Label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-white/5 relative group">
                    <img
                      src={imagePreview || formData.cover_image_url || ''}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reading Time */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 space-y-2">
              <Label className="text-white">Reading Time (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={formData.reading_time_minutes || 5}
                onChange={e => setFormData(prev => ({ ...prev, reading_time_minutes: parseInt(e.target.value) || 5 }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </CardContent>
          </Card>

          {/* SEO Panel */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowSeoPanel(!showSeoPanel)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <CardTitle className="text-white text-lg">SEO Settings</CardTitle>
                </div>
                {showSeoPanel ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </CardHeader>
            {showSeoPanel && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Meta Title</Label>
                  <Input
                    placeholder="SEO title (defaults to post title)"
                    value={formData.meta_title || ''}
                    onChange={e => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    {(formData.meta_title || formData.title || '').length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Meta Description</Label>
                  <Textarea
                    placeholder="Brief description for search engines..."
                    value={formData.meta_description || ''}
                    onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                  <p className="text-xs text-slate-500">
                    {(formData.meta_description || '').length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Keywords</Label>
                  <Input
                    placeholder="keyword1, keyword2, keyword3"
                    value={formData.keywords?.join(', ') || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                    }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-slate-500">Separate with commas</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Canonical URL</Label>
                  <Input
                    placeholder="https://cleubautomation.com/blog/..."
                    value={formData.canonical_url || ''}
                    onChange={e => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
