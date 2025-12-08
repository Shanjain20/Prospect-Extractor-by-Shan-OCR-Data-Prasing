import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { UploadedFile } from '../types';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
  isProcessing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onFilesSelected, 
  files, 
  onRemoveFile,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
      if (newFiles.length > 0) {
        onFilesSelected(newFiles);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onFilesSelected(newFiles);
    }
    // Reset input so same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200 text-center ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <UploadCloud className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-700">
              {isProcessing ? 'Processing files...' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-sm text-gray-500">
              Support for JPG, PNG (Max 20 pages)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {files.map((fileItem) => (
            <div key={fileItem.id} className="relative group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden aspect-[3/4]">
              <img 
                src={fileItem.previewUrl} 
                alt="Preview" 
                className={`w-full h-full object-cover transition-opacity ${fileItem.status === 'processing' ? 'opacity-50' : ''}`} 
              />
              
              {/* Status Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {fileItem.status === 'processing' && (
                   <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   </div>
                 )}
                 {fileItem.status === 'completed' && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      Done
                    </div>
                 )}
                 {fileItem.status === 'error' && (
                    <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      Error
                    </div>
                 )}
              </div>

              {!isProcessing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(fileItem.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};