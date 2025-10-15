import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Search, 
  TrendingUp,
  Zap,
  Clock,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
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

interface AIConfig {
  config_key: string;
  config_value: string;
  description: string;
  is_active: boolean;
}

interface GeneratedContent {
  id: number;
  content_type: string;
  ai_operation: string;
  tokens_used: number;
  cost: number;
  status: string;
  created_at: string;
}

const AIManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [aiConfig, setAIConfig] = useState<AIConfig[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Content Generation Form States
  const [blogForm, setBlogForm] = useState({
    topic: '',
    keywords: '',
    tone: 'professional',
    length: 'medium'
  });

  const [proposalForm, setProposalForm] = useState({
    client_name: '',
    client_business: '',
    service_type: '',
    requirements: '',
    budget: ''
  });

  const [seoForm, setSeoForm] = useState({
    content: '',
    keywords: '',
    content_type: 'blog'
  });

  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsResponse, configResponse] = await Promise.all([
        fetch('/backend/api/ai.php/usage/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        }),
        fetch('/backend/api/ai.php/config', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setUsageStats(statsData.data);
        }
      }

      if (configResponse.ok) {
        const configData = await configResponse.json();
        if (configData.success) {
          setAIConfig(configData.data);
        }
      }

    } catch (err) {
      setError('Failed to load AI data');
      console.error('AI data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBlogContent = async () => {
    if (!blogForm.topic.trim()) {
      toast.error('Please enter a blog topic');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/backend/api/ai.php/generate/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          topic: blogForm.topic,
          keywords: blogForm.keywords.split(',').map(k => k.trim()).filter(k => k),
          tone: blogForm.tone,
          length: blogForm.length
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Blog content generated! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        
        // Open generated content in new window or modal
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>${data.data.title || 'Generated Blog Content'}</title></head>
              <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h1>${data.data.title || 'Generated Blog Content'}</h1>
                <p><strong>Meta Description:</strong> ${data.data.meta_description || 'N/A'}</p>
                <hr>
                <div>${data.data.content || 'No content generated'}</div>
                <hr>
                <p><strong>Tags:</strong> ${(data.data.tags || []).join(', ')}</p>
                <p><strong>Reading Time:</strong> ${data.data.estimated_read_time || 'N/A'} minutes</p>
                <p><strong>Cost:</strong> $${data.cost?.toFixed(4) || '0.00'}</p>
              </body>
            </html>
          `);
        }
        
        // Reset form
        setBlogForm({
          topic: '',
          keywords: '',
          tone: 'professional',
          length: 'medium'
        });
        
        // Reload stats
        loadAIData();
      } else {
        toast.error(data.error || 'Failed to generate blog content');
      }
    } catch (err) {
      toast.error('Failed to generate blog content');
      console.error('Blog generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateProposal = async () => {
    if (!proposalForm.client_name || !proposalForm.service_type || !proposalForm.requirements) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/backend/api/ai.php/generate/proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          client_data: {
            name: proposalForm.client_name,
            business: proposalForm.client_business,
            budget: proposalForm.budget
          },
          service_type: proposalForm.service_type,
          requirements: proposalForm.requirements
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Proposal generated! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        
        // Display proposal in modal or new window
        const proposal = data.data;
        alert(`Proposal Generated:\n\nSubject: ${proposal.subject || 'N/A'}\n\n${proposal.solution || proposal.content || 'No content generated'}`);
        
        // Reset form
        setProposalForm({
          client_name: '',
          client_business: '',
          service_type: '',
          requirements: '',
          budget: ''
        });
        
        loadAIData();
      } else {
        toast.error(data.error || 'Failed to generate proposal');
      }
    } catch (err) {
      toast.error('Failed to generate proposal');
      console.error('Proposal generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testSupportChat = async () => {
    if (!chatMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/backend/api/ai.php/chat/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          message: chatMessage,
          context: {
            source: 'admin_test',
            user_type: 'admin'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setChatResponse(data.data.response);
        toast.success(`Response generated! Cost: $${data.data.cost?.toFixed(4) || '0.00'}`);
        loadAIData();
      } else {
        toast.error(data.error || 'Failed to generate response');
      }
    } catch (err) {
      toast.error('Failed to generate chat response');
      console.error('Chat response error:', err);
    } finally {
      setLoading(false);
    }
  };

  const optimizeForSEO = async () => {
    if (!seoForm.content.trim()) {
      toast.error('Please enter content to optimize');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/backend/api/ai.php/optimize/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          content: seoForm.content,
          keywords: seoForm.keywords.split(',').map(k => k.trim()).filter(k => k),
          content_type: seoForm.content_type
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Content optimized! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        
        // Display optimized content
        const optimized = data.data;
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>SEO Optimized Content</title></head>
              <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h1>SEO Optimization Results</h1>
                <p><strong>SEO Score:</strong> ${optimized.seo_score || 'N/A'}/10</p>
                <p><strong>Suggested Title:</strong> ${optimized.suggested_meta_title || 'N/A'}</p>
                <p><strong>Meta Description:</strong> ${optimized.suggested_meta_description || 'N/A'}</p>
                <hr>
                <h2>Optimized Content:</h2>
                <div>${optimized.optimized_content || 'No content generated'}</div>
                <hr>
                <h3>Improvements Made:</h3>
                <ul>
                  ${(optimized.improvements_made || []).map((imp: string) => `<li>${imp}</li>`).join('')}
                </ul>
              </body>
            </html>
          `);
        }
        
        loadAIData();
      } else {
        toast.error(data.error || 'Failed to optimize content');
      }
    } catch (err) {
      toast.error('Failed to optimize content');
      console.error('SEO optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const budgetUsagePercentage = usageStats 
    ? Math.round((usageStats.current_spend / usageStats.monthly_budget) * 100)
    : 0;

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBudgetIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4" />;
    if (percentage >= 75) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Management</h1>
          <p className="text-muted-foreground">Manage AI integrations, usage, and content generation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAIData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blog">Blog Generator</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="chat">Support Chat</TabsTrigger>
          <TabsTrigger value="seo">SEO Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${usageStats?.monthly_budget?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Budget limit for this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Spend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getBudgetColor(budgetUsagePercentage)}`}>
                  ${usageStats?.current_spend?.toFixed(4) || '0.00'}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {getBudgetIcon(budgetUsagePercentage)}
                  <span>{budgetUsagePercentage}% of budget used</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${usageStats?.remaining_budget?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Usage</CardTitle>
              <CardDescription>Monthly AI spending progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: ${usageStats?.current_spend?.toFixed(4) || '0.00'}</span>
                  <span>Limit: ${usageStats?.monthly_budget?.toFixed(2) || '0.00'}</span>
                </div>
                <Progress 
                  value={budgetUsagePercentage} 
                  className={`h-2 ${budgetUsagePercentage >= 90 ? 'bg-red-100' : budgetUsagePercentage >= 75 ? 'bg-yellow-100' : 'bg-green-100'}`}
                />
                <p className="text-xs text-muted-foreground">
                  {budgetUsagePercentage >= 90 
                    ? 'Warning: Approaching budget limit' 
                    : budgetUsagePercentage >= 75 
                    ? 'Caution: 75% of budget used' 
                    : 'Budget usage is healthy'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Operation</CardTitle>
              <CardDescription>AI operations breakdown for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats?.usage_by_operation?.map((usage, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium capitalize">
                          {usage.operation.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {usage.total_calls} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${usage.total_cost?.toFixed(4) || '0.00'}</p>
                      <p className="text-sm text-muted-foreground">{usage.date}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">
                    No AI operations this month
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Blog Content Generator
              </CardTitle>
              <CardDescription>
                Generate SEO-optimized blog posts with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-topic">Blog Topic *</Label>
                  <Input
                    id="blog-topic"
                    placeholder="e.g., How to Design Professional Logos"
                    value={blogForm.topic}
                    onChange={(e) => setBlogForm({...blogForm, topic: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="blog-keywords"
                    placeholder="logo design, branding, professional"
                    value={blogForm.keywords}
                    onChange={(e) => setBlogForm({...blogForm, keywords: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-tone">Tone</Label>
                  <Select value={blogForm.tone} onValueChange={(value) => setBlogForm({...blogForm, tone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-length">Length</Label>
                  <Select value={blogForm.length} onValueChange={(value) => setBlogForm({...blogForm, length: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (800-1200 words)</SelectItem>
                      <SelectItem value="medium">Medium (1500-2000 words)</SelectItem>
                      <SelectItem value="long">Long (2500-3000 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={generateBlogContent} 
                disabled={loading || !blogForm.topic.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Blog Content
                  </>
                )}
              </Button>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estimated cost: $0.50 - $2.00 depending on length and complexity
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Proposal Generator
              </CardTitle>
              <CardDescription>
                Create personalized client proposals automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name *</Label>
                  <Input
                    id="client-name"
                    placeholder="John Smith"
                    value={proposalForm.client_name}
                    onChange={(e) => setProposalForm({...proposalForm, client_name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client-business">Client Business</Label>
                  <Input
                    id="client-business"
                    placeholder="Tech Startup"
                    value={proposalForm.client_business}
                    onChange={(e) => setProposalForm({...proposalForm, client_business: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type *</Label>
                  <Select value={proposalForm.service_type} onValueChange={(value) => setProposalForm({...proposalForm, service_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Logo Design">Logo Design</SelectItem>
                      <SelectItem value="YouTube Thumbnails">YouTube Thumbnails</SelectItem>
                      <SelectItem value="Video Editing">Video Editing</SelectItem>
                      <SelectItem value="Complete Branding">Complete Branding</SelectItem>
                      <SelectItem value="Website Design">Website Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    placeholder="$500 - $1000"
                    value={proposalForm.budget}
                    onChange={(e) => setProposalForm({...proposalForm, budget: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Project Requirements *</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe the project requirements, goals, and any specific needs..."
                  rows={4}
                  value={proposalForm.requirements}
                  onChange={(e) => setProposalForm({...proposalForm, requirements: e.target.value})}
                />
              </div>
              
              <Button 
                onClick={generateProposal} 
                disabled={loading || !proposalForm.client_name || !proposalForm.service_type || !proposalForm.requirements}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Proposal
                  </>
                )}
              </Button>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estimated cost: $0.30 - $1.00 per proposal
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Support Chat Tester
              </CardTitle>
              <CardDescription>
                Test the AI customer support responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chat-message">Customer Message</Label>
                <Textarea
                  id="chat-message"
                  placeholder="How much does logo design cost?"
                  rows={3}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={testSupportChat} 
                disabled={loading || !chatMessage.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Generate AI Response
                  </>
                )}
              </Button>
              
              {chatResponse && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">AI Response:</Label>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{chatResponse}</p>
                </div>
              )}
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estimated cost: $0.05 - $0.20 per response
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                AI SEO Optimizer
              </CardTitle>
              <CardDescription>
                Optimize content for better search engine rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Target Keywords</Label>
                  <Input
                    id="seo-keywords"
                    placeholder="logo design, branding, professional"
                    value={seoForm.keywords}
                    onChange={(e) => setSeoForm({...seoForm, keywords: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={seoForm.content_type} onValueChange={(value) => setSeoForm({...seoForm, content_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="service">Service Page</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="product">Product Description</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seo-content">Content to Optimize *</Label>
                <Textarea
                  id="seo-content"
                  placeholder="Paste your content here to optimize for SEO..."
                  rows={8}
                  value={seoForm.content}
                  onChange={(e) => setSeoForm({...seoForm, content: e.target.value})}
                />
              </div>
              
              <Button 
                onClick={optimizeForSEO} 
                disabled={loading || !seoForm.content.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Optimize for SEO
                  </>
                )}
              </Button>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estimated cost: $0.20 - $1.00 depending on content length
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIManagement;