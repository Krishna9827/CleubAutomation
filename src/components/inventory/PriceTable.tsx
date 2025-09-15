import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Save } from 'lucide-react';
import { getCategoryColor } from './constants';
import type { PriceData } from './types';

interface PriceTableProps {
  priceData: PriceData[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onUpdateItem: (id: string, field: string, value: string) => void;
  onDeleteItem: (id: string) => void;
}

export const PriceTable = ({ 
  priceData, 
  editingId, 
  setEditingId, 
  onUpdateItem, 
  onDeleteItem 
}: PriceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Type/Variant</TableHead>
          <TableHead>Wattage</TableHead>
          <TableHead>Price per Unit</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {priceData.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Badge variant="outline" className={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
            </TableCell>
            <TableCell>
              {editingId === item.id ? (
                <Input
                  value={item.subcategory || ''}
                  onChange={(e) => onUpdateItem(item.id, 'subcategory', e.target.value)}
                  size="sm"
                />
              ) : (
                <div>
                  {item.subcategory || '-'}
                  {item.category === 'Lights' && item.subcategory && (
                    <div className="text-xs text-slate-500 mt-1">
                      {item.subcategory.toLowerCase().includes('on/off') || item.subcategory.toLowerCase().includes('basic') 
                        ? '(Actuator)' 
                        : '(Dali)'}
                    </div>
                  )}
                </div>
              )}
            </TableCell>
            <TableCell>
              {editingId === item.id ? (
                <Input
                  type="number"
                  value={item.wattage?.toString() || ''}
                  onChange={(e) => onUpdateItem(item.id, 'wattage', e.target.value)}
                  size="sm"
                />
              ) : (
                item.wattage ? `${item.wattage}W` : '-'
              )}
            </TableCell>
            <TableCell>
              {editingId === item.id ? (
                <Input
                  type="number"
                  value={item.pricePerUnit?.toString() || ''}
                  onChange={(e) => onUpdateItem(item.id, 'pricePerUnit', e.target.value)}
                  size="sm"
                />
              ) : (
                `₹${item.pricePerUnit?.toLocaleString() || '0'}`
              )}
            </TableCell>
            <TableCell>
              {editingId === item.id ? (
                <Input
                  value={item.notes || ''}
                  onChange={(e) => onUpdateItem(item.id, 'notes', e.target.value)}
                  size="sm"
                />
              ) : (
                item.notes || '-'
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {editingId === item.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};