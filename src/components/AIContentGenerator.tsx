import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wand2, 
  FileText, 
  Search, 
  Loader2, 
  Copy, 
  Download,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface AIContentGeneratorProps {
  type: 'blog' | 'meta' | 'seo' | 'social';
  onGenerated?: (content: any) => void;
  className?: string;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  type,
  onGenerated,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    tone: 'professional',
    length: 'medium',
    content: '',
    content_type: 'blog'
  });

  const generateContent = async () => {
    if (!formData.topic.trim() && type === 'blog') {
      toast.error('Please enter a topic');
      return;
    }

    if (!formData.content.trim() && (type === 'seo' || type === 'meta')) {
      toast.error('Please enter content to optimize');
      return;
    }

    setLoading(true);
    
    try {
      let endpoint = '';
      let payload = {};

      switch (type) {
        case 'blog':
          endpoint = '/backend/api/ai.php/generate/blog';
          payload = {
            topic: formData.topic,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
            tone: formData.tone,
            length: formData.length
          };
          break;

        case 'seo':
          endpoint = '/backend/api/ai.php/optimize/seo';
          payload = {
            content: formData.content,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
            content_type: formData.content_type
          };
          break;

        case 'meta':
          endpoint = '/backend/api/ai.php/generate/meta';
          payload = {
            content: formData.content,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
          };
          break;

        case 'social':
          endpoint = '/backend/api/ai.php/generate/social';
          payload = {
            topic: formData.topic,
            platform: formData.content_type,
            tone: formData.tone
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data);
        toast.success(`Content generated! Cost: $${data.cost?.toFixed(4) || '0.00'}`);
        
        if (onGenerated) {
          onGenerated(data.data);
        }
      } else {
        toast.error(data.error || 'Failed to generate content');
      }

    } catch (error) {
      toast.error('Failed to generate content');
      console.error('Content generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  const downloadContent = () => {
    if (!generatedContent) return;

    const content = type === 'blog' 
      ? `# ${generatedContent.title}\n\n${generatedContent.content}`
      : JSON.stringify(generatedContent, null, 2);

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-generated-${type}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormFields = () => {
    switch (type) {
      case 'blog':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="topic">Blog Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., How to Design Professional Logos"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="logo design, branding, professional"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
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
                <Label>Length</Label>
                <Select value={formData.length} onValueChange={(value) => setFormData({...formData, length: value})}>
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
          </>
        );

      case 'seo':
      case 'meta':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="content">Content to Optimize *</Label>
              <Textarea
                id="content"
                placeholder="Paste your content here..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords</Label>
              <Input
                id="keywords"
                placeholder="logo design, branding, professional"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
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
          </>
        );

      case 'social':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Message *</Label>
              <Input
                id="topic"
                placeholder="e.g., New logo design service launch"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="engaging">Engaging</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'blog': return 'AI Blog Generator';
      case 'seo': return 'AI SEO Optimizer';
      case 'meta': return 'AI Meta Generator';
      case 'social': return 'AI Social Media Generator';
      default: return 'AI Content Generator';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'blog': return 'Generate SEO-optimized blog posts with AI assistance';
      case 'seo': return 'Optimize your content for better search engine rankings';
      case 'meta': return 'Generate compelling meta titles and descriptions';
      case 'social': return 'Create engaging social media content';
      default: return 'Generate content with AI assistance';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'blog': return <FileText className="h-5 w-5" />;
      case 'seo': return <Search className="h-5 w-5" />;
      case 'meta': return <Search className="h-5 w-5" />;
      case 'social': return <Wand2 className="h-5 w-5" />;
      default: return <Wand2 className="h-5 w-5" />;
    }
  };

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    switch (type) {
      case 'blog':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Blog Content</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent.content)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadContent}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm bg-muted p-2 rounded">{generatedContent.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Reading Time</Label>
                <p className="text-sm bg-muted p-2 rounded">{generatedContent.estimated_read_time} minutes</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Meta Description</Label>
              <p className="text-sm bg-muted p-2 rounded">{generatedContent.meta_description}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Content</Label>
              <div 
                className="text-sm bg-muted p-4 rounded max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: generatedContent.content }}
              />
            </div>
            
            {generatedContent.tags && (
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {generatedContent.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">SEO Optimization Results</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent.optimized_content)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            
            {generatedContent.seo_score && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">SEO Score:</Label>
                <Badge variant={generatedContent.seo_score >= 8 ? "default" : generatedContent.seo_score >= 6 ? "secondary" : "destructive"}>
                  {generatedContent.seo_score}/10
                </Badge>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium">Suggested Meta Title</Label>
                <p className="text-sm bg-muted p-2 rounded">{generatedContent.suggested_meta_title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Suggested Meta Description</Label>
                <p className="text-sm bg-muted p-2 rounded">{generatedContent.suggested_meta_description}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Optimized Content</Label>
              <div 
                className="text-sm bg-muted p-4 rounded max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: generatedContent.optimized_content }}
              />
            </div>
            
            {generatedContent.improvements_made && (
              <div>
                <Label className="text-sm font-medium">Improvements Made</Label>
                <ul className="text-sm bg-muted p-2 rounded list-disc list-inside">
                  {generatedContent.improvements_made.map((improvement: string, index: number) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Content</h3>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(generatedContent, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {getFormFields()}
        </div>
        
        <Button 
          onClick={generateContent} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Estimated cost: $0.10 - $2.00 depending on content type and length
          </AlertDescription>
        </Alert>
        
        {generatedContent && renderGeneratedContent()}
      </CardContent>
    </Card>
  );
};

export default AIContentGenerator;