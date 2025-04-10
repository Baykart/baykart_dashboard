import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image } from "lucide-react";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  previewUrls?: string[];
  maxImages?: number;
}

export const ImageUpload = ({
  onImagesSelected,
  previewUrls = [],
  maxImages = 5
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      // Limit the number of files
      const selectedFiles = fileArray.slice(0, maxImages);
      onImagesSelected(selectedFiles);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setDraggingOver(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      const selectedFiles = fileArray.slice(0, maxImages);
      onImagesSelected(selectedFiles);
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      {previewUrls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          {previewUrls.map((url, index) => (
            <div 
              key={index} 
              className="relative aspect-square border rounded-md overflow-hidden bg-gray-50"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {previewUrls.length < maxImages && (
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer aspect-square
                ${draggingOver ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
              onClick={handleBrowseClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center">Add More</p>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 cursor-pointer
            ${draggingOver ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Image className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium mb-1">Drag and drop images here</p>
          <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB</p>
          <Button type="button" variant="outline" size="sm">
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}; 