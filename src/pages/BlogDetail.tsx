/**
 * Blog Detail Page
 * Individual blog post view with SEO optimization
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchBlogById } from '@/utils/api';
import { SEOHead } from '@/components/seo-head';
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation';
import { RelatedPosts, InternalLinkSuggestions } from '@/components/related-posts';
import { OptimizedCTA } from '@/components/optimized-cta';
import { injectStructuredData, generateArticleSchema } from '@/utils/seo';
import { useAnalytics } from '@/utils/analytics';
import type { Blog } from '@/types';

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const analytics = useAnalytics();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [id]);

  const loadBlog = async () => {
    if (!id) return;
    
    setLoading(true);
    const data = await fetchBlogById(id);
    setBlog(data);
    setLoading(false);

    if (data) {
      // Inject structured data
      const cleanup = injectStructuredData(generateArticleSchema(data));
      
      // Track page view
      analytics.track(analytics.events.BLOG_VIEW, {
        blog_id: data.id,
        blog_title: data.title,
      });

      return cleanup;
    }
  };

  if (loading) {
    return (
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button className="bg-gradient-youtube">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEOHead
        title={`${blog.title} | Adil GFX Blog`}
        description={blog.excerpt}
        image={blog.featuredImage}
        url={`https://adilgfx.com/blog/${blog.slug || blog.id}`}
        type="article"
        keywords={blog.tags.join(', ')}
      />
      
      <main className="pt-24 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: blog.title, href: `/blog/${blog.slug || blog.id}`, isCurrentPage: true }
            ]}
          />
          
          {/* Back button */}
          <Link to="/blog" className="inline-flex items-center text-youtube-red hover:underline mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          {/* Article header */}
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-gradient-youtube text-white px-3 py-1 rounded-full text-sm font-medium">
                {blog.category}
              </span>
              <span className="text-sm text-muted-foreground">{blog.readTime}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center space-x-6 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{blog.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime}</span>
              </div>
            </div>
          </header>

          {/* Featured image */}
          <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-8">
            <img 
              src={blog.featuredImage} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-xl text-muted-foreground mb-6">{blog.excerpt}</p>
            <div className="text-foreground">{blog.content}</div>
            
            {/* Internal link suggestions within content */}
            <InternalLinkSuggestions
              currentPostTags={blog.tags}
              currentPostCategory={blog.category}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag) => (
              <span 
                key={tag}
                className="flex items-center space-x-1 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
              >
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          {/* Related Posts */}
          <RelatedPosts
            currentPostId={blog.id}
            currentPostTags={blog.tags}
            currentPostCategory={blog.category}
            className="mb-12"
          />

          {/* Optimized CTA */}
          <OptimizedCTA 
            variant="blog" 
            trackingId={`blog-${blog.id}`}
          />
        </article>
      </main>
    </>
  );
}
