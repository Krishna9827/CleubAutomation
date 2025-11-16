
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddItemForm } from '@/components/inventory/AddItemForm';
import { PriceTable } from '@/components/inventory/PriceTable';
import { ImportInventory } from '@/components/inventory/ImportInventory';
import { DEFAULT_INVENTORY_PRICES } from '@/constants/inventory';
import { adminService } from '@/supabase/adminService';
import type { PriceData, NewItemForm } from '@/types/inventory';

const InventoryManagement = () => {
  const { toast } = useToast();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState<NewItemForm>({
    category: '',
    subcategory: '',
    wattage: '',
    pricePerUnit: '',
    notes: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await adminService.getAllInventory();
      // Map InventoryItem to PriceData format
      const mappedData = data.map((item: any) => ({
        id: item.id,
        category: item.category,
        subcategory: item.subcategory,
        wattage: item.wattage,
        pricePerUnit: item.price_per_unit,
        notes: item.notes
      }));
      setPriceData(mappedData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setPriceData(DEFAULT_INVENTORY_PRICES);
      toast({
        title: 'Error',
        description: 'Failed to load inventory from database',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePriceData = async (data: PriceData[]) => {
    setPriceData(data);
  };

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.pricePerUnit) {
      toast({
        title: "Error",
        description: "Category and price are required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newPriceItem: any = {
        category: newItem.category,
        subcategory: newItem.subcategory || undefined,
        wattage: newItem.wattage ? parseInt(newItem.wattage) : undefined,
        price_per_unit: parseFloat(newItem.pricePerUnit),
        notes: newItem.notes || undefined
      };

      await adminService.createInventoryItem(newPriceItem);
      await loadInventory();
      
      setNewItem({
        category: '',
        subcategory: '',
        wattage: '',
        pricePerUnit: '',
        notes: ''
      });
      setShowAddForm(false);

      toast({
        title: "Item Added",
        description: "New price item has been added successfully."
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateItem = (id: string, field: string, value: string) => {
    const updatedData = priceData.map(item => {
      if (item.id === id) {
        if (field === 'pricePerUnit') {
          return { ...item, [field]: parseFloat(value) || 0 };
        } else if (field === 'wattage') {
          return { ...item, [field]: value ? parseInt(value) : undefined };
        } else {
          return { ...item, [field]: value || undefined };
        }
      }
      return item;
    });
    savePriceData(updatedData);
  };

  const handleDeleteItem = (id: string) => {
    const updatedData = priceData.filter(item => item.id !== id);
    savePriceData(updatedData);
    
    toast({
      title: "Item Deleted",
      description: "Price item has been removed successfully."
    });
  };

  // Handler for importing inventory from Excel/CSV
  const handleImport = (importedItems: any[]) => {
    // Map imported data to PriceData format
    const mapped = importedItems.map((row: any) => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      category: row.Category || row.category || '',
      subcategory: row.Name || row.name || row.Subcategory || row.subcategory || '',
      wattage: row.Wattage ? parseInt(row.Wattage) : undefined,
      pricePerUnit: row['Price per Unit'] ? parseFloat(row['Price per Unit']) : (row.pricePerUnit ? parseFloat(row.pricePerUnit) : 0),
      notes: row.Notes || row.notes || row['Type/Variant'] || row['type/variant'] || '',
    }));
    const updated = [...priceData, ...mapped];
    savePriceData(updated);
    toast({ title: 'Import Successful', description: `${mapped.length} items imported.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 text-white">Inventory Management</h2>
        <div className="flex gap-2">
          <ImportInventory onImport={handleImport} />
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {showAddForm && (
        <AddItemForm
          newItem={newItem}
          setNewItem={setNewItem}
          onSave={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 text-white">Current Price List</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceTable
            priceData={priceData}
            editingId={editingId}
            setEditingId={setEditingId}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
