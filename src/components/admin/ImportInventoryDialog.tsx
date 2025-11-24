import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, AlertCircle, FileText, Trash2, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processInventoryFile, ParsedInventoryItem, CSVParseResult } from '@/utils/csvParser';
import { adminService } from '@/supabase/adminService';

interface ImportInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess?: (count: number) => void;
}

const ImportInventoryDialog = ({ open, onClose, onImportSuccess }: ImportInventoryDialogProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    try {
      const result = await processInventoryFile(file);
      setParseResult(result);

      if (result.success) {
        // Auto-select all valid items
        setSelectedItems(new Set(result.items.map((_, idx) => idx)));
        toast({
          title: '✅ File Parsed Successfully',
          description: `Found ${result.validRows} valid items out of ${result.totalRows} rows`,
        });
      } else {
        toast({
          title: '❌ Failed to Parse File',
          description: result.errors[0] || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to process file',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!parseResult || selectedItems.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one item to import',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const itemsToImport = parseResult.items.filter((_, idx) => selectedItems.has(idx));

      console.log('💾 Importing', itemsToImport.length, 'items...');

      // Call bulk insert
      const result = await adminService.bulkInsertInventory(itemsToImport);

      if (result) {
        toast({
          title: '✅ Import Successful',
          description: `Successfully imported ${itemsToImport.length} inventory items`,
        });

        onImportSuccess?.(itemsToImport.length);
        resetDialog();
        onClose();
      } else {
        toast({
          title: '❌ Import Failed',
          description: 'Failed to import items to database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: '❌ Error',
        description: 'An error occurred during import',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setParseResult(null);
    setSelectedItems(new Set());
    setShowPreview(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const toggleItemSelection = (idx: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (parseResult) {
      setSelectedItems(new Set(parseResult.items.map((_, idx) => idx)));
    }
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-400" />
            Import Inventory
          </DialogTitle>
          <DialogDescription>
            Drag and drop a CSV or Excel file to import inventory items
          </DialogDescription>
        </DialogHeader>

        {!parseResult ? (
          // Upload Section
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-slate-600 bg-slate-900/50 hover:border-teal-500/50'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-semibold text-white mb-2">
                Drag and drop your CSV or Excel file
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Or click the button below to select a file
              </p>

              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />

              <Button
                asChild
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select File
                </label>
              </Button>
            </div>

            <Alert className="bg-blue-900/30 border-blue-600 text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Supported formats: CSV, XLSX, XLS. The tool will automatically detect column headers.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // Preview & Import Section
          <div className="space-y-4">
            {/* Status Summary */}
            <Card className="border-white/10 bg-slate-900/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Total Rows</div>
                    <div className="text-2xl font-bold text-white">
                      {parseResult.totalRows}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Valid Items</div>
                    <div className="text-2xl font-bold text-green-400">
                      {parseResult.validRows}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Selected</div>
                    <div className="text-2xl font-bold text-teal-400">
                      {selectedItems.size}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Status</div>
                    <Badge className={parseResult.success ? 'bg-green-600' : 'bg-red-600'}>
                      {parseResult.success ? 'Ready' : 'Error'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Errors ({parseResult.errors.length}):</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {parseResult.errors.slice(0, 3).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {parseResult.errors.length > 3 && (
                      <li className="text-slate-300">...and {parseResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <Alert className="bg-yellow-900/30 border-yellow-600 text-yellow-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Warnings ({parseResult.warnings.length}):</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {parseResult.warnings.slice(0, 3).map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                    {parseResult.warnings.length > 3 && (
                      <li className="text-slate-300">...and {parseResult.warnings.length - 3} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full border-slate-600 text-slate-300"
            >
              <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
              {showPreview ? 'Hide' : 'Show'} Preview ({parseResult.items.length} items)
            </Button>

            {/* Preview Section */}
            {showPreview && (
              <Card className="border-white/10 bg-slate-900/50 max-h-96 overflow-y-auto">
                <CardHeader className="sticky top-0 bg-slate-900 border-b border-white/10">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Preview</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={selectAll}
                        className="border-slate-600 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={deselectAll}
                        className="border-slate-600 text-xs"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 p-4">
                    {parseResult.items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleItemSelection(idx)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedItems.has(idx)
                            ? 'border-teal-500 bg-teal-900/20'
                            : 'border-slate-700 bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(idx)}
                            onChange={() => toggleItemSelection(idx)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-slate-400 space-y-1">
                              <div>Category: {item.category}</div>
                              <div>Price: ₹{item.price_per_unit?.toLocaleString()}</div>
                              {item.wattage && <div>Wattage: {item.wattage}W</div>}
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setParseResult(null);
                  setSelectedItems(new Set());
                }}
                variant="outline"
                className="border-slate-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose Another File
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting || selectedItems.size === 0}
                className="ml-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isImporting ? 'Importing...' : `Import ${selectedItems.size} Items`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportInventoryDialog;
