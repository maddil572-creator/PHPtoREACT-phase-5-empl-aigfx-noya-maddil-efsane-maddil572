import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AIUsageStats {
  current_spend: number;
  monthly_budget: number;
  remaining_budget: number;
  usage_by_operation: Array<{
    operation: string;
    total_calls: number;
    total_cost: number;
    date: string;
  }>;
}

interface AIGenerationOptions {
  topic?: string;
  keywords?: string[];
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  content?: string;
  content_type?: string;
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  cost?: number;
}

export const useAIFeatures = () => {
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load AI usage statistics
  const loadUsageStats = async () => {
    try {
      const response = await fetch('/backend/api/ai.php/usage/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsageStats(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load AI usage stats:', err);
    }
  };

  // Generate blog content
  const generateBlogContent = async (options: AIGenerationOptions): Promise<AIResponse> => {
    if (!options.topic?.trim()) {
      return { success: false, error: 'Topic is required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/backend/api/ai.php/generate/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          topic: options.topic,
          keywords: options.keywords || [],
          tone: options.tone || 'professional',
          length: options.length || 'medium'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Blog content generated! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        await loadUsageStats(); // Refresh stats
      } else {
        toast.error(data.error || 'Failed to generate blog content');
      }

      return data;

    } catch (err) {
      const error = 'Failed to generate blog content';
      toast.error(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Generate client proposal
  const generateProposal = async (clientData: any, serviceType: string, requirements: string): Promise<AIResponse> => {
    if (!clientData.name || !serviceType || !requirements) {
      return { success: false, error: 'All fields are required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/backend/api/ai.php/generate/proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          client_data: clientData,
          service_type: serviceType,
          requirements: requirements
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Proposal generated! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        await loadUsageStats();
      } else {
        toast.error(data.error || 'Failed to generate proposal');
      }

      return data;

    } catch (err) {
      const error = 'Failed to generate proposal';
      toast.error(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Optimize content for SEO
  const optimizeForSEO = async (options: AIGenerationOptions): Promise<AIResponse> => {
    if (!options.content?.trim()) {
      return { success: false, error: 'Content is required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/backend/api/ai.php/optimize/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          content: options.content,
          keywords: options.keywords || [],
          content_type: options.content_type || 'blog'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Content optimized! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        await loadUsageStats();
      } else {
        toast.error(data.error || 'Failed to optimize content');
      }

      return data;

    } catch (err) {
      const error = 'Failed to optimize content';
      toast.error(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Generate meta tags
  const generateMetaTags = async (content: string, keywords: string[] = []): Promise<AIResponse> => {
    if (!content?.trim()) {
      return { success: false, error: 'Content is required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/backend/api/ai.php/generate/meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          content: content,
          keywords: keywords
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Meta tags generated! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        await loadUsageStats();
      } else {
        toast.error(data.error || 'Failed to generate meta tags');
      }

      return data;

    } catch (err) {
      const error = 'Failed to generate meta tags';
      toast.error(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Send chat message
  const sendChatMessage = async (message: string, sessionId?: string, context?: any): Promise<AIResponse> => {
    if (!message?.trim()) {
      return { success: false, error: 'Message is required' };
    }

    try {
      const response = await fetch('/backend/api/ai.php/chat/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          session_id: sessionId,
          context: context || {}
        })
      });

      const data = await response.json();
      return data;

    } catch (err) {
      return { success: false, error: 'Failed to send chat message' };
    }
  };

  // Check if AI features are enabled
  const checkAIAvailability = async (): Promise<boolean> => {
    try {
      const response = await fetch('/backend/api/ai.php/usage/stats');
      return response.ok;
    } catch (err) {
      return false;
    }
  };

  // Get budget usage percentage
  const getBudgetUsagePercentage = (): number => {
    if (!usageStats) return 0;
    return Math.round((usageStats.current_spend / usageStats.monthly_budget) * 100);
  };

  // Check if budget allows for operation
  const canMakeAICall = (estimatedCost: number = 1.0): boolean => {
    if (!usageStats) return true;
    return (usageStats.current_spend + estimatedCost) <= usageStats.monthly_budget;
  };

  // Get budget status color
  const getBudgetStatusColor = (): string => {
    const percentage = getBudgetUsagePercentage();
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Load stats on mount
  useEffect(() => {
    loadUsageStats();
  }, []);

  return {
    // State
    usageStats,
    loading,
    error,

    // Actions
    generateBlogContent,
    generateProposal,
    optimizeForSEO,
    generateMetaTags,
    sendChatMessage,
    loadUsageStats,

    // Utilities
    checkAIAvailability,
    getBudgetUsagePercentage,
    canMakeAICall,
    getBudgetStatusColor
  };
};

// Hook for AI chat functionality
export const useAIChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string, context?: any) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/backend/api/ai.php/chat/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          session_id: sessionId,
          context: context || {
            source: 'website_chat',
            page: window.location.pathname
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.data.response,
          timestamp: new Date(),
          suggested_actions: data.data.suggested_actions || []
        };

        setMessages(prev => [...prev, aiMessage]);
        
        if (data.data.session_id) {
          setSessionId(data.data.session_id);
        }
      } else {
        const errorMessage = {
          id: `error-${Date.now()}`,
          type: 'system',
          content: 'Sorry, I encountered an error. Please try again or contact us directly.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Connection error. Please check your internet connection and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai',
        content: "👋 Hi! I'm here to help you with questions about our design services. How can I assist you today?",
        timestamp: new Date(),
        suggested_actions: ['view_services', 'request_quote', 'view_portfolio']
      };
      setMessages([welcomeMessage]);
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearChat,
    initializeChat
  };
};

export default useAIFeatures;