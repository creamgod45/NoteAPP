import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Alert, AlertDescription } from './alert';
import { format } from 'date-fns';

interface FileData {
  [key: string]: any;
}

export interface FileOperationsProps {
  /** 當前資料用於匯出 */
  data: FileData;
  /** 當文件成功匯入時的回調函數 */
  onImport: (data: FileData) => void;
  /** 匯出文件的名稱前綴 */
  fileNamePrefix?: string;
  /** 顯示拖放區域 */
  showDropZone?: boolean;
  /** 額外的CSS類名 */
  className?: string;
}

export function FileOperations({
  onImport,
  showDropZone = true,
  className = '',
}: FileOperationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropActive, setDropActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 處理匯入功能
  const handleImport = (file: File): void => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (typeof e.target?.result === 'string') {
          const importedData = JSON.parse(e.target.result) as FileData;
          onImport(importedData);
          setError(null);
        }
      } catch (err) {
        setError('匯入資料格式不正確，請確保是有效的 JSON 檔案');
        console.error('Import error:', err);
      }
    };
    
    reader.onerror = () => {
      setError('讀取檔案時發生錯誤');
    };
    
    reader.readAsText(file);
  };

  // 處理文件選擇變更
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    // 重置 input 值，允許重複選擇相同文件
    if (event.target) {
      event.target.value = '';
    }
  };

  // 處理拖放相關事件
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDropActive(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDropActive(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDropActive(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleImport(files[0]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-4 flex-wrap">        
        {/* 隱藏的檔案輸入 */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".json" 
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'none' }} 
        />
        
        {/* 匯入按鈕 */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="bg-green-50 text-white hover:bg-green-100"
        >
          匯入資料
        </Button>
      </div>
      
      {/* 拖放區域 */}
      {showDropZone && (
        <Card
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2  border-dashed p-6 text-center transition-colors ${
            dropActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <p className="text-sm text-gray-300">
            將 JSON 檔案拖放至此處，或
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-500 hover:text-blue-700 underline mx-1"
              type="button"
            >
              點擊此處
            </button>
            選擇檔案
          </p>
        </Card>
      )}
    </div>
  );
}