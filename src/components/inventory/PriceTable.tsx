import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Save } from 'lucide-react';
import { getCategoryColor } from './constants';
import type { PriceData } from './types';

const subcategoryOptions = [
  'Wired',
  'Wireless',
  'Dali',
  'Actuator',
  'Smart',
  'With Driver',
  'Without Driver',
];
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
          <TableHead>Name</TableHead>
          <TableHead>Type/Variant</TableHead>
          <TableHead>Wattage</TableHead>
          <TableHead>Price per Unit</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {priceData.map((item) => {
          const isOther = item.category === 'Other' || item.category === 'Others';
          return (
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
                    placeholder="Enter name"
                  />
                ) : (
                  <span className="font-medium text-slate-900">{item.subcategory || '-'}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <Select
                        value={subcategoryOptions.includes(item.notes || '') ? item.notes || '' : ''}
                        onValueChange={(value) => onUpdateItem(item.id, 'notes', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type/variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategoryOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2">
                      <Input
                        value={item.notes && !subcategoryOptions.includes(item.notes) ? item.notes : ''}
                        onChange={(e) => onUpdateItem(item.id, 'notes', e.target.value)}
                        placeholder="Custom type/variant"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">{item.notes || '-'}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={item.wattage?.toString() || ''}
                    onChange={(e) => onUpdateItem(item.id, 'wattage', e.target.value)}
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
          );
        })}
      </TableBody>
    </Table>
  );
};