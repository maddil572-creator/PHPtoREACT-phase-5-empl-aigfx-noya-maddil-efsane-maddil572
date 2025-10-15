import { useState, useEffect } from 'react';
import { Check, X, Plus, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTags, type Tag } from '@/hooks/useTags';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  category?: 'service' | 'portfolio' | 'blog' | 'general';
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  category,
  placeholder = "Select tags...",
  maxTags = 10,
  className = "",
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { tags, loading } = useTags({ 
    category, 
    search: searchTerm,
    sort: 'usage_count',
    order: 'DESC'
  });

  const availableTags = tags.filter(tag => 
    !selectedTags.some(selected => selected.id === tag.id)
  );

  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      return;
    }
    onTagsChange([...selectedTags, tag]);
    setOpen(false);
  };

  const handleTagRemove = (tagId: number) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const createNewTag = () => {
    // This would typically open a dialog to create a new tag
    // For now, we'll just show a placeholder
    console.log('Create new tag:', searchTerm);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
              style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
            >
              <Hash className="h-3 w-3" />
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleTagRemove(tag.id!)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left font-normal"
            disabled={selectedTags.length >= maxTags}
          >
            <Plus className="h-4 w-4 mr-2" />
            {selectedTags.length >= maxTags
              ? `Maximum ${maxTags} tags selected`
              : placeholder
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading tags...</CommandEmpty>
              ) : (
                <>
                  {availableTags.length === 0 && searchTerm && (
                    <CommandGroup>
                      <CommandItem onSelect={createNewTag}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create "{searchTerm}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  
                  {availableTags.length === 0 && !searchTerm && (
                    <CommandEmpty>No tags available</CommandEmpty>
                  )}
                  
                  {availableTags.length > 0 && (
                    <CommandGroup>
                      {availableTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => handleTagSelect(tag)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            {tag.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-32">
                                {tag.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {tag.total_usage !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {tag.total_usage}
                              </Badge>
                            )}
                            <Check className="h-4 w-4 opacity-0" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tag Limit Info */}
      {selectedTags.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedTags.length} of {maxTags} tags selected
        </p>
      )}
    </div>
  );
}

// Simplified tag display component
interface TagDisplayProps {
  tags: Tag[];
  showCount?: boolean;
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TagDisplay({
  tags,
  showCount = false,
  maxDisplay = 5,
  size = 'md',
  className = "",
}: TagDisplayProps) {
  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2',
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className={`${sizeClasses[size]} flex items-center gap-1`}
          style={{ 
            backgroundColor: `${tag.color}10`, 
            borderColor: `${tag.color}40`,
            color: tag.color 
          }}
        >
          <Hash className="h-3 w-3" />
          {tag.name}
          {showCount && tag.total_usage !== undefined && (
            <span className="ml-1 opacity-70">({tag.total_usage})</span>
          )}
        </Badge>
      ))}
      
      {remainingCount > 0 && (
        <Badge variant="outline" className={sizeClasses[size]}>
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}

// Tag filter component for public pages
interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagSlug: string) => void;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onTagToggle,
  className = "",
}: TagFilterProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-sm">Filter by tags:</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug);
          return (
            <Button
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onTagToggle(tag.slug)}
              className="h-8"
              style={
                isSelected
                  ? { backgroundColor: tag.color, borderColor: tag.color }
                  : { borderColor: tag.color, color: tag.color }
              }
            >
              <Hash className="h-3 w-3 mr-1" />
              {tag.name}
              {tag.total_usage !== undefined && (
                <span className="ml-1 opacity-70">({tag.total_usage})</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}