/**
 * Related Posts Component
 * Shows related blog posts for better internal linking and user engagement
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { fetchBlogs } from "@/utils/api";
import type { Blog } from "@/types";

interface RelatedPostsProps {
  currentPostId: string;
  currentPostTags: string[];
  currentPostCategory: string;
  maxPosts?: number;
  className?: string;
}

export function RelatedPosts({
  currentPostId,
  currentPostTags,
  currentPostCategory,
  maxPosts = 3,
  className = ""
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, currentPostTags, currentPostCategory]);

  const loadRelatedPosts = async () => {
    setLoading(true);
    
    try {
      // Fetch all published posts
      const response = await fetchBlogs(1, 50); // Get more posts to filter from
      const allPosts = response.data.filter((post: Blog) => post.id !== currentPostId);
      
      // Score posts based on relevance
      const scoredPosts = allPosts.map((post: Blog) => {
        let score = 0;
        
        // Same category gets highest score
        if (post.category === currentPostCategory) {
          score += 10;
        }
        
        // Shared tags get points
        const sharedTags = post.tags.filter(tag => 
          currentPostTags.some(currentTag => 
            currentTag.toLowerCase() === tag.toLowerCase()
          )
        );
        score += sharedTags.length * 3;
        
        // Featured posts get bonus points
        if (post.featured) {
          score += 2;
        }
        
        // Recent posts get slight bonus
        const daysSincePublished = Math.floor(
          (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSincePublished < 30) {
          score += 1;
        }
        
        return { ...post, relevanceScore: score };
      });
      
      // Sort by relevance score and take top posts
      const topRelatedPosts = scoredPosts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxPosts);
      
      setRelatedPosts(topRelatedPosts);
    } catch (error) {
      console.error('Error loading related posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-5 w-5 text-youtube-red" />
          <h3 className="text-xl font-bold text-foreground">Related Articles</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: maxPosts }).map((_, index) => (
            <div key={index} className="card-premium animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-5 w-5 text-youtube-red" />
        <h3 className="text-xl font-bold text-foreground">Related Articles</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug || post.id}`}
            className="block group"
          >
            <article className="card-premium hover:scale-105 transition-all duration-500 h-full flex flex-col">
              {/* Featured image */}
              <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Category and read time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </span>
                </div>
                
                {/* Title */}
                <h4 className="text-lg font-semibold text-foreground mb-3 group-hover:text-youtube-red transition-colors line-clamp-2 flex-1">
                  {post.title}
                </h4>
                
                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-youtube-red/10 text-youtube-red px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Date and read more */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-youtube-red group-hover:translate-x-1 transition-transform">
                    <span className="text-xs font-medium">Read more</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      {/* View all posts CTA */}
      <div className="text-center pt-6 border-t border-border">
        <Link to="/blog">
          <button className="text-youtube-red hover:underline font-medium flex items-center mx-auto space-x-2">
            <span>View All Articles</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Internal Link Suggestions Component
 * Suggests relevant internal links within blog content
 */
interface InternalLinkSuggestionsProps {
  currentPostTags: string[];
  currentPostCategory: string;
  maxSuggestions?: number;
}

export function InternalLinkSuggestions({
  currentPostTags,
  currentPostCategory,
  maxSuggestions = 5
}: InternalLinkSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Array<{
    title: string;
    url: string;
    type: 'service' | 'page' | 'portfolio';
    relevance: number;
  }>>([]);

  useEffect(() => {
    generateSuggestions();
  }, [currentPostTags, currentPostCategory]);

  const generateSuggestions = () => {
    const allSuggestions = [];
    
    // Service page suggestions based on tags/category
    const serviceMapping: Record<string, string> = {
      'logo': '/services#logo-design',
      'thumbnail': '/services#youtube-thumbnails',
      'video': '/services#video-editing',
      'branding': '/services#branding',
      'design': '/services',
      'youtube': '/services#youtube-thumbnails',
    };
    
    // Page suggestions
    const pageMapping: Record<string, string> = {
      'portfolio': '/portfolio',
      'testimonial': '/testimonials',
      'pricing': '/services#pricing',
      'contact': '/contact',
      'faq': '/faq',
      'about': '/about',
    };
    
    // Check tags for relevant suggestions
    currentPostTags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      
      // Service suggestions
      Object.entries(serviceMapping).forEach(([keyword, url]) => {
        if (lowerTag.includes(keyword)) {
          allSuggestions.push({
            title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Services`,
            url,
            type: 'service' as const,
            relevance: 3
          });
        }
      });
      
      // Page suggestions
      Object.entries(pageMapping).forEach(([keyword, url]) => {
        if (lowerTag.includes(keyword)) {
          allSuggestions.push({
            title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Page`,
            url,
            type: 'page' as const,
            relevance: 2
          });
        }
      });
    });
    
    // Category-based suggestions
    if (currentPostCategory.toLowerCase().includes('design')) {
      allSuggestions.push({
        title: 'View Our Design Portfolio',
        url: '/portfolio',
        type: 'portfolio',
        relevance: 4
      });
    }
    
    // Remove duplicates and sort by relevance
    const uniqueSuggestions = allSuggestions.filter((item, index, self) =>
      index === self.findIndex(t => t.url === item.url)
    );
    
    const sortedSuggestions = uniqueSuggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSuggestions);
    
    setSuggestions(sortedSuggestions);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-subtle rounded-xl p-6 my-8">
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <ArrowRight className="h-5 w-5 text-youtube-red mr-2" />
        You Might Also Be Interested In
      </h4>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Link
            key={index}
            to={suggestion.url}
            className="block p-3 rounded-lg border border-border hover:border-youtube-red/50 hover:bg-card transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground group-hover:text-youtube-red transition-colors">
                {suggestion.title}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-youtube-red group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}