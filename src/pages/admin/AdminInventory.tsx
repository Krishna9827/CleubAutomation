import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Package, Trash2, Edit } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminTable, ColumnDef, ActionButton } from '@/components/admin/AdminTable';
import { adminService } from '@/supabase/adminService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabase/config';
import { InventoryItem } from '@/types/inventory';

const AdminInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);

  // Load inventory with realtime
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllInventory();
        console.log('✅ Loaded inventory items:', data.length);
        setItems(data);
      } catch (error) {
        console.error('❌ Error loading inventory:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inventory',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadInventory();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('inventory-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload: any) => {
          console.log('📦 Inventory change detected:', payload.eventType);
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as InventoryItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [toast]);

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      await adminService.deleteInventoryItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast({ title: 'Success', description: 'Item deleted' });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      header: 'Category',
      accessor: 'category',
      searchable: true,
    },
    {
      header: 'Sub-Category',
      accessor: 'subcategory',
    },
    {
      header: 'Wattage',
      accessor: 'wattage',
      cell: (row) => `${row.wattage || 'N/A'} W`,
    },
    {
      header: 'Price',
      accessor: 'price_per_unit',
      cell: (row) => `₹${row.price_per_unit?.toLocaleString()}`,
    },
    {
      header: 'Notes',
      accessor: 'notes',
      cell: (row) => (
        <div className="max-w-xs truncate text-slate-300">
          {row.notes || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const actions: ActionButton<InventoryItem>[] = [
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'destructive',
    },
  ];

  const searchKeys: (keyof InventoryItem)[] = ['category', 'subcategory'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Inventory</h1>
            <p className="text-slate-400">Manage products and pricing</p>
          </div>
        </div>

        <AdminTable<InventoryItem>
          data={items}
          columns={columns}
          actions={actions}
          searchKeys={searchKeys}
          searchPlaceholder="Search by category or sub-category..."
          loading={loading}
          emptyMessage="No inventory items"
          itemsPerPage={15}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
