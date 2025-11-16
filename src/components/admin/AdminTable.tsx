import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

export interface ActionButton<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export interface AdminTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionButton<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  title?: string;
  itemsPerPage?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function AdminTable<T extends { id: string | number }>({
  data,
  columns,
  actions = [],
  searchPlaceholder = 'Search...',
  searchKeys = [],
  title,
  itemsPerPage = 10,
  loading = false,
  emptyMessage = 'No data found',
  className = '',
}: AdminTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Filter data based on search term
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    return searchKeys.some((key) => {
      const value = row[key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(term);
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    
    return row[column.accessor];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with search */}
      <div className="flex items-center justify-between gap-4">
        {title && (
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        )}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Badge variant="outline" className="bg-teal-900/30 border-teal-600 text-teal-400">
          {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-slate-400 py-12">
            Loading...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-slate-800/50">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`text-slate-300 font-semibold ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    }`}
                    onClick={() => {
                      if (column.sortable && typeof column.accessor !== 'function') {
                        handleSort(column.accessor as keyof T);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && sortConfig.key === column.accessor && (
                        <span className="text-teal-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="text-slate-300 font-semibold text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/10 hover:bg-slate-800/30 transition-colors"
                >
                  {columns.map((column, index) => (
                    <TableCell key={index} className="text-slate-200">
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-900 border-slate-700 text-white"
                        >
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={`cursor-pointer hover:bg-slate-800 ${
                                action.className || ''
                              }`}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of{' '}
            {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
