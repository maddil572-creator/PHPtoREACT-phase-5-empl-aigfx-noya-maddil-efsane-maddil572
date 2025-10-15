import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Tag as TagIcon, Hash, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTags, useTagMutations, useTagCategories, type Tag } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

export function TagManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created' | 'updated'>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  const { tags, loading, error, refetch } = useTags({ 
    admin: true,
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    status: selectedStatus || undefined,
    featured: showFeaturedOnly || undefined,
    sort: sortBy,
    order: sortOrder,
  });
  
  const { createTag, updateTag, deleteTag, loading: mutationLoading } = useTagMutations();
  const { categories } = useTagCategories();
  
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [formData, setFormData] = useState<Partial<Tag>>({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    category: 'general',
    is_featured: false,
    status: 'active',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: '',
      category: 'general',
      is_featured: false,
      status: 'active',
    });
    setSelectedTag(null);
    setIsEditing(false);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setFormData(tag);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast.error('Tag name is required');
        return;
      }

      if (selectedTag?.id) {
        await updateTag(selectedTag.id, formData);
        toast.success('Tag updated successfully');
      } else {
        await createTag(formData);
        toast.success('Tag created successfully');
        setShowCreateDialog(false);
      }

      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to save tag');
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!tag.id) return;
    
    if (window.confirm(`Are you sure you want to delete "${tag.name}"? This will remove it from all services.`)) {
      try {
        await deleteTag(tag.id);
        toast.success('Tag deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete tag');
      }
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setShowFeaturedOnly(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tags...</p>
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
          <h2 className="text-2xl font-bold">Tag Management</h2>
          <p className="text-muted-foreground">Organize and manage service tags and categories</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag to organize and categorize services
              </DialogDescription>
            </DialogHeader>
            <TagEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={mutationLoading}
              onNameChange={handleNameChange}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Tags</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [sort, order] = value.split('-');
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-ASC">Name (A-Z)</SelectItem>
                  <SelectItem value="name-DESC">Name (Z-A)</SelectItem>
                  <SelectItem value="usage-DESC">Most Used</SelectItem>
                  <SelectItem value="usage-ASC">Least Used</SelectItem>
                  <SelectItem value="created-DESC">Newest</SelectItem>
                  <SelectItem value="created-ASC">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={showFeaturedOnly}
                onCheckedChange={setShowFeaturedOnly}
              />
              <Label htmlFor="featured">Featured tags only</Label>
            </div>
            
            {(searchQuery || selectedCategory || selectedStatus || showFeaturedOnly) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tag Editor (when editing) */}
      {isEditing && selectedTag && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Editing: {selectedTag.name}</span>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TagEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={resetForm}
              isLoading={mutationLoading}
              onNameChange={handleNameChange}
              categories={categories}
            />
          </CardContent>
        </Card>
      )}

      {/* Tags Grid */}
      <div className="grid gap-4">
        {tags.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tags found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory || selectedStatus || showFeaturedOnly
                  ? 'Try adjusting your filters or search criteria'
                  : 'Create your first tag to get started'
                }
              </p>
              {!(searchQuery || selectedCategory || selectedStatus || showFeaturedOnly) && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Tag
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <Card key={tag.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: tag.color }}
                      />
                      <h3 className="font-semibold truncate">{tag.name}</h3>
                      {tag.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: categories.find(c => c.value === tag.category)?.color,
                          color: categories.find(c => c.value === tag.category)?.color
                        }}
                      >
                        {categories.find(c => c.value === tag.category)?.label}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {tag.status === 'active' ? (
                          <Eye className="h-3 w-3 text-green-500" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {tag.status}
                        </span>
                      </div>
                    </div>
                    
                    {tag.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tag.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>/{tag.slug}</span>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>{tag.service_count || 0} services</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TagEditorProps {
  formData: Partial<Tag>;
  setFormData: (data: Partial<Tag>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  onNameChange: (name: string) => void;
  categories: any[];
}

function TagEditor({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  onNameChange,
  categories,
}: TagEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tag Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter tag name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={formData.slug || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="tag-url-slug"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this tag..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-muted-foreground">{category.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Tag Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color || '#3B82F6'}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-16 h-10"
            />
            <Input
              type="text"
              value={formData.color || '#3B82F6'}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Icon Name</Label>
          <Input
            id="icon"
            value={formData.icon || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="Lucide icon name (e.g., Star)"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
        />
        <Label htmlFor="featured">Featured tag</Label>
      </div>

      <Separator />

      <div className="flex justify-end gap-4">
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
            'Save Tag'
          )}
        </Button>
      </div>
    </div>
  );
}