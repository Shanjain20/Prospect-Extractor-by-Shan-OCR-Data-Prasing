import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultsTable } from './components/ResultsTable';
import { UploadedFile, Prospect } from './types';
import { extractDataFromImage, fileToBase64 } from './services/geminiService';
import { downloadCSV } from './utils/csvHelper';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';

const MAX_FILES = 20;

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed list of all prospects from all processed files
  const allProspects = files.flatMap(f => f.extractedData || []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (files.length + newFiles.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} images at a time.`);
      return;
    }
    setError(null);

    const newUploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newUploadedFiles]);
  }, [files]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const processImages = async () => {
    setIsProcessing(true);
    setError(null);

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    if (pendingFiles.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Process sequentially to update UI properly and avoid rate limits if any
    // Although Gemini handles concurrent requests, keeping it sequential for better UX feedback 
    // on progress per image is often nicer for OCR tasks.
    
    // We clone the files array to update state efficiently
    let currentFilesState = [...files];

    for (const fileItem of pendingFiles) {
      // Update status to processing
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing' } : f));

      try {
        const base64Data = await fileToBase64(fileItem.file);
        const data = await extractDataFromImage(base64Data, fileItem.file.type);
        
        // Update status to completed with data
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed', extractedData: data } : f
        ));
      } catch (err) {
        console.error(`Error processing file ${fileItem.file.name}:`, err);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setError(null);
    setIsProcessing(false);
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const processedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Upload Book Pages</h2>
          <p className="text-gray-500">
            Upload images of contact lists or directory pages. AI will automatically extract and structure the data for you.
          </p>
        </div>

        {/* Upload Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <ImageUploader 
            onFilesSelected={handleFilesSelected} 
            files={files} 
            onRemoveFile={removeFile}
            isProcessing={isProcessing}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Action Bar */}
          {files.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500 font-medium">
                {isProcessing ? (
                   <span className="text-indigo-600 animate-pulse">Processing... ({processedCount}/{files.length})</span>
                ) : (
                   <span>{pendingCount > 0 ? `${pendingCount} files ready to process` : 'All files processed'}</span>
                )}
                {errorCount > 0 && <span className="text-red-500 ml-2">({errorCount} failed)</span>}
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                
                <button
                  onClick={processImages}
                  disabled={isProcessing || pendingCount === 0}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-md transition-all
                    ${isProcessing || pendingCount === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-indigo-700 hover:shadow-lg active:scale-95'}`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Start Extraction
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        {allProspects.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultsTable 
              prospects={allProspects} 
              onExport={() => downloadCSV(allProspects)} 
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
