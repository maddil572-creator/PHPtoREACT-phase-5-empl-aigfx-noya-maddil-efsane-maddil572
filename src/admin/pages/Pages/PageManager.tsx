import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Globe, FileText, Settings, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePages, usePageMutations, type Page, type PageSection } from '@/hooks/usePages';

const PAGE_TEMPLATES = [
  { value: 'default', label: 'Default Page' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'service', label: 'Service Page' },
  { value: 'portfolio', label: 'Portfolio Page' },
  { value: 'blog', label: 'Blog Page' },
];

const PAGE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'published', label: 'Published', color: 'bg-green-500' },
  { value: 'archived', label: 'Archived', color: 'bg-red-500' },
];

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'text', label: 'Text Content' },
  { value: 'image', label: 'Image' },
  { value: 'gallery', label: 'Image Gallery' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'services', label: 'Services' },
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'custom_html', label: 'Custom HTML' },
];

export function PageManager() {
  const { pages, loading, error, refetch } = usePages({ admin: true });
  const { createPage, updatePage, deletePage, loading: mutationLoading } = usePageMutations();
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [formData, setFormData] = useState<Partial<Page>>({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft',
    template: 'default',
    show_in_navigation: false,
    navigation_order: 0,
    featured_image: '',
    custom_css: '',
    custom_js: '',
    seo_title: '',
    canonical_url: '',
    sections: [],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      meta_description: '',
      meta_keywords: '',
      status: 'draft',
      template: 'default',
      show_in_navigation: false,
      navigation_order: 0,
      featured_image: '',
      custom_css: '',
      custom_js: '',
      seo_title: '',
      canonical_url: '',
      sections: [],
    });
    setSelectedPage(null);
    setIsEditing(false);
  };

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      ...page,
      sections: page.sections || [],
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.slug) {
        toast.error('Title and slug are required');
        return;
      }

      if (selectedPage?.id) {
        await updatePage(selectedPage.id, formData);
        toast.success('Page updated successfully');
      } else {
        await createPage(formData);
        toast.success('Page created successfully');
        setShowCreateDialog(false);
      }

      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to save page');
    }
  };

  const handleDelete = async (page: Page) => {
    if (!page.id) return;
    
    if (window.confirm(`Are you sure you want to delete "${page.title}"?`)) {
      try {
        await deletePage(page.id);
        toast.success('Page deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete page');
      }
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo_title: prev.seo_title || title,
    }));
  };

  const addSection = () => {
    const newSection: PageSection = {
      type: 'text',
      title: '',
      content: '',
      data: {},
      display_order: formData.sections?.length || 0,
    };
    
    setFormData(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
  };

  const updateSection = (index: number, section: PageSection) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.map((s, i) => i === index ? section : s) || [],
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== index) || [],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your website pages</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Build a new page with custom content and sections
              </DialogDescription>
            </DialogHeader>
            <PageEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={mutationLoading}
              onTitleChange={handleTitleChange}
              addSection={addSection}
              updateSection={updateSection}
              removeSection={removeSection}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isEditing && selectedPage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Editing: {selectedPage.title}</span>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PageEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={resetForm}
              isLoading={mutationLoading}
              onTitleChange={handleTitleChange}
              addSection={addSection}
              updateSection={updateSection}
              removeSection={removeSection}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-4">Create your first custom page to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{page.title}</h3>
                      <Badge 
                        className={`${PAGE_STATUSES.find(s => s.value === page.status)?.color} text-white`}
                      >
                        {PAGE_STATUSES.find(s => s.value === page.status)?.label}
                      </Badge>
                      {page.show_in_navigation && (
                        <Badge variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          In Navigation
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">/{page.slug}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Template: {PAGE_TEMPLATES.find(t => t.value === page.template)?.label}
                    </p>
                    {page.meta_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {page.meta_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Sections: {page.sections_count || 0}</span>
                      <span>Updated: {new Date(page.updated_at || '').toLocaleDateString()}</span>
                      {page.created_by_name && <span>By: {page.created_by_name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {page.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface PageEditorProps {
  formData: Partial<Page>;
  setFormData: (data: Partial<Page>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  onTitleChange: (title: string) => void;
  addSection: () => void;
  updateSection: (index: number, section: PageSection) => void;
  removeSection: (index: number) => void;
}

function PageEditor({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  onTitleChange,
  addSection,
  updateSection,
  removeSection,
}: PageEditorProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter page title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="page-url-slug"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select
              value={formData.template}
              onValueChange={(value) => setFormData(prev => ({ ...prev, template: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_TEMPLATES.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="navigation"
            checked={formData.show_in_navigation}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_in_navigation: checked }))}
          />
          <Label htmlFor="navigation">Show in navigation menu</Label>
        </div>

        {formData.show_in_navigation && (
          <div className="space-y-2">
            <Label htmlFor="nav_order">Navigation Order</Label>
            <Input
              id="nav_order"
              type="number"
              value={formData.navigation_order || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, navigation_order: parseInt(e.target.value) || 0 }))}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="featured_image">Featured Image URL</Label>
          <Input
            id="featured_image"
            value={formData.featured_image || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">Main Content</Label>
          <Textarea
            id="content"
            value={formData.content || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter main page content..."
            rows={8}
          />
        </div>

        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Page Sections</h4>
          <Button onClick={addSection} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {formData.sections?.map((section, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Section {index + 1}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSection(index)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Section Type</Label>
                  <Select
                    value={section.type}
                    onValueChange={(value) => updateSection(index, { ...section, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={section.title || ''}
                    onChange={(e) => updateSection(index, { ...section, title: e.target.value })}
                    placeholder="Section title"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Section Content</Label>
                <Textarea
                  value={section.content || ''}
                  onChange={(e) => updateSection(index, { ...section, content: e.target.value })}
                  placeholder="Section content..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="seo" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo_title">SEO Title</Label>
          <Input
            id="seo_title"
            value={formData.seo_title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
            placeholder="SEO optimized title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea
            id="meta_description"
            value={formData.meta_description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
            placeholder="Brief description for search engines..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_keywords">Meta Keywords</Label>
          <Input
            id="meta_keywords"
            value={formData.meta_keywords || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="canonical_url">Canonical URL</Label>
          <Input
            id="canonical_url"
            value={formData.canonical_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
            placeholder="https://example.com/page"
          />
        </div>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="custom_css">Custom CSS</Label>
          <Textarea
            id="custom_css"
            value={formData.custom_css || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_css: e.target.value }))}
            placeholder="/* Custom CSS for this page */"
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_js">Custom JavaScript</Label>
          <Textarea
            id="custom_js"
            value={formData.custom_js || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_js: e.target.value }))}
            placeholder="// Custom JavaScript for this page"
            rows={8}
            className="font-mono text-sm"
          />
        </div>
      </TabsContent>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Page
            </>
          )}
        </Button>
      </div>
    </Tabs>
  );
}