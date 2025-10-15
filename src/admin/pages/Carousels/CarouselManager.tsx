import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Play, Pause, Image, Settings, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCarousels, useCarouselMutations, type Carousel, type CarouselSlide } from '@/hooks/useCarousels';

const CAROUSEL_TYPES = [
  { value: 'hero', label: 'Hero Carousel', description: 'Main page hero sections' },
  { value: 'testimonials', label: 'Testimonials', description: 'Customer testimonials' },
  { value: 'portfolio', label: 'Portfolio', description: 'Portfolio showcase' },
  { value: 'products', label: 'Products', description: 'Product displays' },
  { value: 'images', label: 'Image Gallery', description: 'General image carousel' },
  { value: 'custom', label: 'Custom', description: 'Custom content carousel' },
];

const ANIMATION_TYPES = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'flip', label: 'Flip' },
];

const BUTTON_STYLES = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

export function CarouselManager() {
  const { carousels, loading, error, refetch } = useCarousels({ admin: true });
  const { createCarousel, updateCarousel, deleteCarousel, loading: mutationLoading } = useCarouselMutations();
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [formData, setFormData] = useState<Partial<Carousel>>({
    name: '',
    slug: '',
    type: 'images',
    autoplay: true,
    autoplay_speed: 5000,
    show_dots: true,
    show_arrows: true,
    infinite_loop: true,
    slides_to_show: 1,
    slides_to_scroll: 1,
    animation_type: 'slide',
    animation_speed: 500,
    pause_on_hover: true,
    status: 'active',
    responsive_breakpoints: [],
    slides: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: 'images',
      autoplay: true,
      autoplay_speed: 5000,
      show_dots: true,
      show_arrows: true,
      infinite_loop: true,
      slides_to_show: 1,
      slides_to_scroll: 1,
      animation_type: 'slide',
      animation_speed: 500,
      pause_on_hover: true,
      status: 'active',
      responsive_breakpoints: [],
      slides: [],
    });
    setSelectedCarousel(null);
    setIsEditing(false);
  };

  const handleEdit = (carousel: Carousel) => {
    setSelectedCarousel(carousel);
    setFormData({
      ...carousel,
      slides: carousel.slides || [],
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error('Name and slug are required');
        return;
      }

      if (selectedCarousel?.id) {
        await updateCarousel(selectedCarousel.id, formData);
        toast.success('Carousel updated successfully');
      } else {
        await createCarousel(formData);
        toast.success('Carousel created successfully');
        setShowCreateDialog(false);
      }

      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to save carousel');
    }
  };

  const handleDelete = async (carousel: Carousel) => {
    if (!carousel.id) return;
    
    if (window.confirm(`Are you sure you want to delete "${carousel.name}"?`)) {
      try {
        await deleteCarousel(carousel.id);
        toast.success('Carousel deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete carousel');
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

  const addSlide = () => {
    const newSlide: CarouselSlide = {
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      video_url: '',
      link_url: '',
      link_text: '',
      link_target: '_self',
      background_color: '',
      text_color: '',
      button_style: 'primary',
      display_order: formData.slides?.length || 0,
      custom_css: '',
      custom_data: {},
    };
    
    setFormData(prev => ({
      ...prev,
      slides: [...(prev.slides || []), newSlide],
    }));
  };

  const updateSlide = (index: number, slide: CarouselSlide) => {
    setFormData(prev => ({
      ...prev,
      slides: prev.slides?.map((s, i) => i === index ? { ...slide, display_order: index } : s) || [],
    }));
  };

  const removeSlide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slides: prev.slides?.filter((_, i) => i !== index).map((slide, i) => ({ ...slide, display_order: i })) || [],
    }));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...(formData.slides || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < slides.length) {
      [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];
      slides.forEach((slide, i) => slide.display_order = i);
      
      setFormData(prev => ({ ...prev, slides }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading carousels...</p>
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
          <h2 className="text-2xl font-bold">Carousel Manager</h2>
          <p className="text-muted-foreground">Create and manage dynamic carousels and sliders</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Carousel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Carousel</DialogTitle>
              <DialogDescription>
                Build a new carousel with custom slides and settings
              </DialogDescription>
            </DialogHeader>
            <CarouselEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={mutationLoading}
              onNameChange={handleNameChange}
              addSlide={addSlide}
              updateSlide={updateSlide}
              removeSlide={removeSlide}
              moveSlide={moveSlide}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isEditing && selectedCarousel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Editing: {selectedCarousel.name}</span>
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarouselEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={resetForm}
              isLoading={mutationLoading}
              onNameChange={handleNameChange}
              addSlide={addSlide}
              updateSlide={updateSlide}
              removeSlide={removeSlide}
              moveSlide={moveSlide}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {carousels.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No carousels yet</h3>
              <p className="text-muted-foreground mb-4">Create your first carousel to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Carousel
              </Button>
            </CardContent>
          </Card>
        ) : (
          carousels.map((carousel) => (
            <Card key={carousel.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{carousel.name}</h3>
                      <Badge 
                        variant={carousel.status === 'active' ? 'default' : 'secondary'}
                      >
                        {carousel.status}
                      </Badge>
                      <Badge variant="outline">
                        {CAROUSEL_TYPES.find(t => t.value === carousel.type)?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">/{carousel.slug}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Slides: {carousel.slides_count || 0}</span>
                      <span>Animation: {carousel.animation_type}</span>
                      <span>Speed: {carousel.autoplay_speed}ms</span>
                      {carousel.autoplay && (
                        <Badge variant="outline" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Autoplay
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Updated: {new Date(carousel.updated_at || '').toLocaleDateString()}</span>
                      {carousel.created_by_name && <span>By: {carousel.created_by_name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {carousel.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/?carousel=${carousel.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(carousel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(carousel)}
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

interface CarouselEditorProps {
  formData: Partial<Carousel>;
  setFormData: (data: Partial<Carousel>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  onNameChange: (name: string) => void;
  addSlide: () => void;
  updateSlide: (index: number, slide: CarouselSlide) => void;
  removeSlide: (index: number) => void;
  moveSlide: (index: number, direction: 'up' | 'down') => void;
}

function CarouselEditor({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  onNameChange,
  addSlide,
  updateSlide,
  removeSlide,
  moveSlide,
}: CarouselEditorProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic Settings</TabsTrigger>
        <TabsTrigger value="slides">Slides</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Carousel Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter carousel name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="carousel-url-slug"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Carousel Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAROUSEL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
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

        <Separator />

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Display Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slides_to_show">Slides to Show</Label>
              <Input
                id="slides_to_show"
                type="number"
                value={formData.slides_to_show || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, slides_to_show: parseInt(e.target.value) || 1 }))}
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slides_to_scroll">Slides to Scroll</Label>
              <Input
                id="slides_to_scroll"
                type="number"
                value={formData.slides_to_scroll || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, slides_to_scroll: parseInt(e.target.value) || 1 }))}
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Animation Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animation_type">Animation Type</Label>
              <Select
                value={formData.animation_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, animation_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="animation_speed">Animation Speed (ms)</Label>
              <Input
                id="animation_speed"
                type="number"
                value={formData.animation_speed || 500}
                onChange={(e) => setFormData(prev => ({ ...prev, animation_speed: parseInt(e.target.value) || 500 }))}
                min="100"
                max="2000"
                step="100"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Autoplay Settings</h4>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoplay">Enable Autoplay</Label>
              <p className="text-sm text-muted-foreground">Automatically advance slides</p>
            </div>
            <Switch
              id="autoplay"
              checked={formData.autoplay}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoplay: checked }))}
            />
          </div>
          
          {formData.autoplay && (
            <div className="space-y-2">
              <Label htmlFor="autoplay_speed">Autoplay Speed (ms)</Label>
              <Input
                id="autoplay_speed"
                type="number"
                value={formData.autoplay_speed || 5000}
                onChange={(e) => setFormData(prev => ({ ...prev, autoplay_speed: parseInt(e.target.value) || 5000 }))}
                min="1000"
                max="10000"
                step="500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pause_on_hover">Pause on Hover</Label>
              <p className="text-sm text-muted-foreground">Pause autoplay when hovering</p>
            </div>
            <Switch
              id="pause_on_hover"
              checked={formData.pause_on_hover}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pause_on_hover: checked }))}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Navigation</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_arrows">Show Arrows</Label>
                <p className="text-sm text-muted-foreground">Previous/Next buttons</p>
              </div>
              <Switch
                id="show_arrows"
                checked={formData.show_arrows}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_arrows: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_dots">Show Dots</Label>
                <p className="text-sm text-muted-foreground">Dot indicators</p>
              </div>
              <Switch
                id="show_dots"
                checked={formData.show_dots}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_dots: checked }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="infinite_loop">Infinite Loop</Label>
              <p className="text-sm text-muted-foreground">Loop back to first slide</p>
            </div>
            <Switch
              id="infinite_loop"
              checked={formData.infinite_loop}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, infinite_loop: checked }))}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="slides" className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Carousel Slides</h4>
          <Button onClick={addSlide} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </Button>
        </div>

        {formData.slides?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No slides yet</h3>
              <p className="text-muted-foreground mb-4">Add your first slide to get started</p>
              <Button onClick={addSlide}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Slide
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {formData.slides?.map((slide, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Slide {index + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === (formData.slides?.length || 0) - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSlide(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={slide.title || ''}
                        onChange={(e) => updateSlide(index, { ...slide, title: e.target.value })}
                        placeholder="Slide title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={slide.subtitle || ''}
                        onChange={(e) => updateSlide(index, { ...slide, subtitle: e.target.value })}
                        placeholder="Slide subtitle"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={slide.description || ''}
                      onChange={(e) => updateSlide(index, { ...slide, description: e.target.value })}
                      placeholder="Slide description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={slide.image_url || ''}
                        onChange={(e) => updateSlide(index, { ...slide, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={slide.video_url || ''}
                        onChange={(e) => updateSlide(index, { ...slide, video_url: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Link URL</Label>
                      <Input
                        value={slide.link_url || ''}
                        onChange={(e) => updateSlide(index, { ...slide, link_url: e.target.value })}
                        placeholder="/page or https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link Text</Label>
                      <Input
                        value={slide.link_text || ''}
                        onChange={(e) => updateSlide(index, { ...slide, link_text: e.target.value })}
                        placeholder="Learn More"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Style</Label>
                      <Select
                        value={slide.button_style || 'primary'}
                        onValueChange={(value) => updateSlide(index, { ...slide, button_style: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUTTON_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={slide.background_color || '#ffffff'}
                        onChange={(e) => updateSlide(index, { ...slide, background_color: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={slide.text_color || '#000000'}
                        onChange={(e) => updateSlide(index, { ...slide, text_color: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Responsive Breakpoints</CardTitle>
            <CardDescription>
              Configure how the carousel behaves on different screen sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Responsive breakpoints will be available in a future update.
            </p>
          </CardContent>
        </Card>
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
              Save Carousel
            </>
          )}
        </Button>
      </div>
    </Tabs>
  );
}