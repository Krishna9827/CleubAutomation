import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Trash2, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminTable, ColumnDef, ActionButton } from '@/components/admin/AdminTable';
import { adminService, Inquiry } from '@/supabase/adminService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabase/config';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const realtimeChannelRef = useRef<any>(null);

  // Load inquiries with realtime subscription
  useEffect(() => {
    const loadInquiries = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllInquiries();
        console.log('✅ Loaded inquiries:', data.length);
        setInquiries(data);
      } catch (error) {
        console.error('❌ Error loading inquiries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inquiries',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('inquiries-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload: any) => {
          console.log('📨 Inquiry change detected:', payload.eventType);
          if (payload.eventType === 'INSERT') {
            setInquiries((prev) => [payload.new as Inquiry, ...prev]);
            toast({
              title: 'New Inquiry',
              description: `From ${payload.new.name}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setInquiries((prev) =>
              prev.map((inq) => (inq.id === payload.new.id ? payload.new : inq))
            );
          } else if (payload.eventType === 'DELETE') {
            setInquiries((prev) => prev.filter((inq) => inq.id !== payload.old.id));
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

  // Delete inquiry
  const handleDelete = async (inquiry: Inquiry) => {
    try {
      await adminService.deleteInquiry(inquiry.id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== inquiry.id));
      toast({
        title: 'Success',
        description: 'Inquiry deleted',
      });
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inquiry',
        variant: 'destructive'
      });
    }
  };

  // Mark as read
  const handleMarkAsRead = async (inquiry: Inquiry) => {
    try {
      await adminService.updateInquiryStatus(inquiry.id, 'read');
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiry.id ? { ...inq, status: 'read' } : inq
        )
      );
      toast({ title: 'Success', description: 'Marked as read' });
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inquiry',
        variant: 'destructive'
      });
    }
  };

  const columns: ColumnDef<Inquiry>[] = [
    {
      header: 'Name',
      accessor: 'name',
      searchable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      searchable: true,
    },
    {
      header: 'Phone',
      accessor: 'phone',
      searchable: true,
    },
    {
      header: 'Message',
      accessor: 'message',
      cell: (row) => (
        <div className="max-w-xs truncate text-slate-300">
          {row.message}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge
          className={
            row.status === 'read'
              ? 'bg-emerald-600'
              : 'bg-amber-600'
          }
        >
          {row.status === 'read' ? '✓ Read' : '● New'}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const actions: ActionButton<Inquiry>[] = [
    {
      label: 'Mark as Read',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleMarkAsRead,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'destructive',
    },
  ];

  const searchKeys: (keyof Inquiry)[] = ['name', 'email', 'phone', 'message'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Customer Inquiries</h1>
            <p className="text-slate-400">Manage customer inquiries and contact submissions</p>
          </div>
        </div>

        <AdminTable<Inquiry>
          data={inquiries}
          columns={columns}
          actions={actions}
          searchKeys={searchKeys}
          searchPlaceholder="Search by name, email, or phone..."
          loading={loading}
          emptyMessage="No inquiries yet"
          itemsPerPage={15}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminInquiries;
