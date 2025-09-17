import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportInventoryProps {
  onImport: (items: any[]) => void;
}

export const ImportInventory: React.FC<ImportInventoryProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      onImport(json);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="mb-2 text-white"
      >
        <Upload className="w-4 h-4 mr-2 text-white" />
        Import from Excel/CSV
      </Button>
    </div>
  );
};
