import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, Copy, Loader2, Image as ImageIcon, Check, FolderOpen } from "lucide-react";
import type { MediaLibrary } from "@shared/schema";

interface AssetImage {
  filename: string;
  url: string;
  path: string;
  size: number;
}

export default function AdminMediaLibrary() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("assets");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    url: "",
    category: "banner",
    filename: "",
    altText: "",
    tags: "",
  });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Fetch available asset images
  const { data: assetImages = [], isLoading: assetsLoading } = useQuery<AssetImage[]>({
    queryKey: ["/api/assets/images"],
  });

  // Fetch uploaded media from database
  const { data: mediaItems = [], isLoading: mediaLoading } = useQuery<MediaLibrary[]>({
    queryKey: ["/api/media-library", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const res = await fetch(`/api/media-library${params}`);
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: typeof uploadForm) => {
      return apiRequest("POST", "/api/media-library", {
        ...data,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
        isTemporary: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
      setUploadDialogOpen(false);
      setUploadForm({
        url: "",
        category: "banner",
        filename: "",
        altText: "",
        tags: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/media-library/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast({
      title: "Copied!",
      description: "Image URL copied to clipboard",
    });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const categories = [
    { value: "all", label: "All Media" },
    { value: "banner", label: "Banners" },
    { value: "category", label: "Categories" },
    { value: "logo", label: "Logos" },
    { value: "product", label: "Products" },
    { value: "general", label: "General" },
  ];

  const filteredItems = selectedCategory === "all" 
    ? mediaItems 
    : mediaItems.filter(item => item.category === selectedCategory);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Browse available assets and manage uploaded media</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-media">
              <Upload className="mr-2 h-4 w-4" />
              Upload New Media
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-upload-media">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Image URL *</Label>
                <Input
                  id="url"
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-media-url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload images to Cloudinary or use external URLs
                </p>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                >
                  <SelectTrigger data-testid="select-media-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="logo">Logo</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filename">Filename *</Label>
                <Input
                  id="filename"
                  value={uploadForm.filename}
                  onChange={(e) => setUploadForm({ ...uploadForm, filename: e.target.value })}
                  placeholder="hero-banner.jpg"
                  data-testid="input-media-filename"
                />
              </div>
              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={uploadForm.altText}
                  onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                  placeholder="Description of the image"
                  data-testid="input-media-alt"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="fashion, banner, promo"
                  data-testid="input-media-tags"
                />
              </div>
              <Button
                onClick={() => uploadMutation.mutate(uploadForm)}
                disabled={!uploadForm.url || !uploadForm.filename || uploadMutation.isPending}
                className="w-full"
                data-testid="button-submit-media"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} data-testid={`tab-${cat.value}`}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload your first image to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden" data-testid={`media-card-${item.id}`}>
              <div className="aspect-video bg-muted relative">
                <img
                  src={item.url}
                  alt={item.altText || item.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                {item.isTemporary && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Temporary
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="font-semibold text-sm truncate mb-2" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {item.category}
                  </span>
                  {item.tags && item.tags.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      +{item.tags.length} tags
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(item.url, item.id)}
                    data-testid={`button-copy-${item.id}`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this media?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
