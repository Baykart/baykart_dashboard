import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import type { Article, CreateArticleDTO } from '../lib/types';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: CreateArticleDTO) => Promise<void>;
  isLoading?: boolean;
}

const SAMPLE_CATEGORIES = [
  'Technology', 'Business', 'Science', 'Health', 
  'Politics', 'Entertainment', 'Sports', 'Education'
];

export function ArticleForm({ article, onSubmit, isLoading }: ArticleFormProps) {
  const [formData, setFormData] = useState<CreateArticleDTO>({
    title: '',
    brief: '',
    content: '',
    source: '',
    image_url: '',
    category: '',
    tags: [],
    publish_date: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        brief: article.brief || '',
        content: article.content,
        source: article.source,
        image_url: article.image_url || '',
        category: article.category || '',
        tags: article.tags || [],
        publish_date: article.publish_date || new Date().toISOString(),
      });
      if (article.image_url) {
        setPreviewImage(article.image_url);
      }
    }
  }, [article]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.brief.trim()) {
      newErrors.brief = 'Brief is required';
    } else if (formData.brief.length < 10) {
      newErrors.brief = 'Brief must be at least 10 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Enter article title"
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="brief" className="text-sm font-medium">
              Brief <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="brief"
              value={formData.brief}
              onChange={e => {
                setFormData(prev => ({ ...prev, brief: e.target.value }));
                if (errors.brief) {
                  setErrors(prev => ({ ...prev, brief: '' }));
                }
              }}
              placeholder="Write a brief summary of the article..."
              className={cn("min-h-[80px] resize-y", errors.brief && "border-red-500")}
            />
            {errors.brief && (
              <p className="text-red-500 text-xs mt-1">{errors.brief}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={e => {
                setFormData(prev => ({ ...prev, content: e.target.value }));
                if (errors.content) {
                  setErrors(prev => ({ ...prev, content: '' }));
                }
              }}
              placeholder="Write your article content here..."
              className={cn("min-h-[200px] resize-y", errors.content && "border-red-500")}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="source" className="text-sm font-medium">
              Source <span className="text-red-500">*</span>
            </Label>
            <Input
              id="source"
              value={formData.source}
              onChange={e => {
                setFormData(prev => ({ ...prev, source: e.target.value }));
                if (errors.source) {
                  setErrors(prev => ({ ...prev, source: '' }));
                }
              }}
              placeholder="Enter article source"
              className={cn(errors.source && "border-red-500")}
            />
            {errors.source && (
              <p className="text-red-500 text-xs mt-1">{errors.source}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="category"
                value={formData.category}
                onChange={e => {
                  setFormData(prev => ({ ...prev, category: e.target.value }));
                  if (errors.category) {
                    setErrors(prev => ({ ...prev, category: '' }));
                  }
                }}
                placeholder="Select or type a category"
                list="categories"
                className={cn(errors.category && "border-red-500")}
              />
              <datalist id="categories">
                {SAMPLE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Tags</Label>
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Publication Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.publish_date && "text-muted-foreground"
                  )}
                >
                  {formData.publish_date ? (
                    format(new Date(formData.publish_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.publish_date ? new Date(formData.publish_date) : undefined}
                  onSelect={(date) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      publish_date: date ? date.toISOString() : new Date().toISOString() 
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="image" className="text-sm font-medium">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
            />
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
            {previewImage && (
              <Card className="mt-2 p-2">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-h-[200px] w-full object-cover rounded"
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </form>
  );
} 