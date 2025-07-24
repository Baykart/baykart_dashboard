import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { ArticleForm } from '@/components/ArticleForm';
import { articleService } from '@/lib/articleService';
import type { Article } from '@/lib/types';
import { Plus, Edit, Trash2 } from "lucide-react";

export function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({ count: 0, next: null as string | null, previous: null as string | null, page: 1, pageSize: 10 });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadArticles = async (page = 1, pageSize = 10) => {
    try {
      const { results, count, next, previous } = await articleService.getArticles(page, pageSize);
      setArticles(Array.isArray(results) ? results : []);
      setPagination({ count, next, previous, page, pageSize });
    } catch (error) {
      setArticles([]);
      toast({
        title: 'Error',
        description: 'Failed to load articles',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadArticles(pagination.page, pagination.pageSize);
    // eslint-disable-next-line
  }, [pagination.page, pagination.pageSize]);

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.brief.toLowerCase().includes(search.toLowerCase()) ||
    article.content.toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreate = async (data: any) => {
    setIsLoading(true);
    try {
      await articleService.createArticle(data);
      await loadArticles(pagination.page, pagination.pageSize);
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Article created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create article',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedArticle) return;
    setIsLoading(true);
    try {
      await articleService.updateArticle(selectedArticle.id, data);
      await loadArticles(pagination.page, pagination.pageSize);
      setIsDialogOpen(false);
      setSelectedArticle(null);
      toast({
        title: 'Success',
        description: 'Article updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update article',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await articleService.deleteArticle(article.id);
      await loadArticles(pagination.page, pagination.pageSize);
      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Articles</h1>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                CREATE NEW ARTICLE
              </Button>
            </div>
            
            <div className="mb-6">
              <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map(article => (
                <Card key={article.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-lg line-clamp-1">{article.title}</span>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary hover:text-primary-foreground hover:bg-primary"
                          onClick={() => {
                            setSelectedArticle(article);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => handleDelete(article)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-1">{article.brief}</p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{article.content}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Source: {article.source}</p>
                      {article.category && <p>Category: {article.category}</p>}
                      <p>Published: {new Date(article.publish_date || '').toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <span>Page {pagination.page} of {totalPages || 1}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === totalPages || totalPages === 0}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedArticle ? 'Edit Article' : 'Create Article'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedArticle ? 'Update the article details below.' : 'Fill in the details to create a new article.'}
                  </DialogDescription>
                </DialogHeader>
                <ArticleForm
                  article={selectedArticle || undefined}
                  onSubmit={selectedArticle ? handleUpdate : handleCreate}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
} 