
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddItemForm } from './inventory/AddItemForm';
import { PriceTable } from './inventory/PriceTable';
import { ImportInventory } from './inventory/ImportInventory';
import { defaultPrices } from './inventory/constants';
import type { PriceData, NewItemForm } from './inventory/types';

const InventoryManagement = () => {
  const { toast } = useToast();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    category: '',
    subcategory: '',
    wattage: '',
    pricePerUnit: '',
    notes: ''
  });

  useEffect(() => {
    try {
      const savedPrices = localStorage.getItem('inventoryPrices');
      if (savedPrices) {
        const parsed = JSON.parse(savedPrices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPriceData(parsed);
        } else {
          setPriceData(defaultPrices);
          localStorage.setItem('inventoryPrices', JSON.stringify(defaultPrices));
        }
      } else {
        setPriceData(defaultPrices);
        localStorage.setItem('inventoryPrices', JSON.stringify(defaultPrices));
      }
    } catch (error) {
      console.error('Error loading price data:', error);
      setPriceData(defaultPrices);
      localStorage.setItem('inventoryPrices', JSON.stringify(defaultPrices));
    }
  }, []);

  const savePriceData = (data: PriceData[]) => {
    setPriceData(data);
    localStorage.setItem('inventoryPrices', JSON.stringify(data));
  };

  const handleAddItem = () => {
    if (!newItem.category || !newItem.pricePerUnit) {
      toast({
        title: "Error",
        description: "Category and price are required fields.",
        variant: "destructive"
      });
      return;
    }


    // If category is Other/Others, treat subcategory as custom name, but keep category as 'Other' and subcategory as the custom name
    const isOther = newItem.category === 'Other' || newItem.category === 'Others';
    const newPriceItem: PriceData = {
      id: Date.now().toString(),
      category: newItem.category,
      subcategory: isOther ? (newItem.subcategory || undefined) : (newItem.subcategory || undefined),
      wattage: newItem.wattage ? parseInt(newItem.wattage) : undefined,
      pricePerUnit: parseFloat(newItem.pricePerUnit),
      notes: newItem.notes || undefined
    };

    const updatedData = [...priceData, newPriceItem];
    savePriceData(updatedData);
    
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
        <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
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
          <CardTitle className="text-lg text-slate-800">Current Price List</CardTitle>
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
