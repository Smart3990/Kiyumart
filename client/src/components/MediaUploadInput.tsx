import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Loader2, X, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: "image" | "video" | "both";
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function MediaUploadInput({
  id,
  label,
  value,
  onChange,
  accept = "image",
  placeholder = "https://example.com/image.jpg",
  description,
  required = false,
  disabled = false,
}: MediaUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const { toast } = useToast();

  const validateImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectURL = URL.createObjectURL(file);

      img.onload = function() {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        URL.revokeObjectURL(objectURL);
        resolve({ width, height });
      };

      img.onerror = function() {
        URL.revokeObjectURL(objectURL);
        reject("Failed to load image");
      };

      img.src = objectURL;
    });
  };

  const validateVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = function() {
        reject("Failed to load video");
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (accept === "image" && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (accept === "video" && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB for images, 30MB for videos)
    const maxSize = accept === "video" ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum size is ${accept === "video" ? "30MB" : "10MB"}`,
        variant: "destructive",
      });
      return;
    }

    // Validate 4K image dimensions (3840x2160 minimum)
    if (isImage) {
      try {
        const { width, height } = await validateImageDimensions(file);
        if (width < 3840 || height < 2160) {
          toast({
            title: "Image resolution too low",
            description: `Image is ${width}×${height}px. Minimum required: 3840×2160px (4K)`,
            variant: "destructive",
          });
          e.target.value = "";
          return;
        }
      } catch (error) {
        toast({
          title: "Validation failed",
          description: "Could not validate image dimensions",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate video duration (<30 seconds)
    if (isVideo) {
      try {
        const duration = await validateVideoDuration(file);
        if (duration > 30) {
          toast({
            title: "Video too long",
            description: `Video is ${Math.round(duration)}s. Maximum allowed: 30 seconds`,
            variant: "destructive",
          });
          e.target.value = "";
          return;
        }
      } catch (error) {
        toast({
          title: "Validation failed",
          description: "Could not validate video duration",
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = isVideo ? "/api/upload/video" : "/api/upload/image";
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);

      toast({
        title: "Upload successful",
        description: `${isVideo ? "Video" : "Image"} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleClearValue = () => {
    onChange("");
  };

  const getAcceptAttribute = () => {
    if (accept === "image") return "image/*";
    if (accept === "video") return "video/*";
    return "image/*,video/*";
  };

  const getFileTypeLabel = () => {
    if (accept === "image") return "image";
    if (accept === "video") return "video";
    return "image or video";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "url" | "upload")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" disabled={disabled}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Enter URL
          </TabsTrigger>
          <TabsTrigger value="upload" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-2">
          <div className="flex gap-2">
            <Input
              id={id}
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              data-testid={`input-${id}`}
            />
            {value && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearValue}
                disabled={disabled}
                data-testid={`button-clear-${id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading || disabled}
              onClick={() => document.getElementById(`${id}-file-input`)?.click()}
              className="flex-1"
              data-testid={`button-upload-${id}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  {accept === "video" ? (
                    <Video className="h-4 w-4 mr-2" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Choose {getFileTypeLabel()}
                </>
              )}
            </Button>
            <input
              id={`${id}-file-input`}
              type="file"
              accept={getAcceptAttribute()}
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading || disabled}
            />
            {value && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearValue}
                disabled={disabled}
                data-testid={`button-clear-upload-${id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {value && (
            <p className="text-xs text-muted-foreground break-all">
              Current: {value}
            </p>
          )}
        </TabsContent>
      </Tabs>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value && accept === "image" && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="max-w-xs h-32 object-cover rounded border"
            data-testid={`img-preview-${id}`}
          />
        </div>
      )}

      {value && accept === "video" && (
        <div className="mt-2">
          <video
            src={value}
            controls
            className="max-w-xs h-32 rounded border"
            data-testid={`video-preview-${id}`}
          />
        </div>
      )}
    </div>
  );
}
