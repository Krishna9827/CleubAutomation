/**
 * CSV Parser for Inventory Import
 * Handles CSV/Excel file parsing and data extraction
 */

export interface ParsedInventoryItem {
  product_name: string;
  category: string;
  subcategory: string;
  price_per_unit: number;
  wattage?: number | null;
  notes?: string | null;
  vendor?: string;
  protocol?: string;
}

export interface CSVParseResult {
  success: boolean;
  items: ParsedInventoryItem[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Parse CSV content string into array of objects
 */
export const parseCSV = (csvContent: string): string[][] => {
  const lines = csvContent.split('\n');
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Handle quoted fields
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current) {
      fields.push(current.trim());
    }

    result.push(fields);
  }

  return result;
};

/**
 * Extract inventory items from parsed CSV data
 * Matches column headers and extracts relevant fields
 */
export const extractInventoryData = (csvData: string[][]): CSVParseResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const items: ParsedInventoryItem[] = [];

  if (csvData.length < 2) {
    errors.push('CSV file is empty or contains only headers');
    return { success: false, items, errors, warnings, totalRows: 0, validRows: 0 };
  }

  // Find column indices from headers
  const headers = csvData[0].map(h => h.toLowerCase().trim());

  const getColumnIndex = (keywords: string[]): number => {
    return headers.findIndex(h =>
      keywords.some(k => h.includes(k.toLowerCase()))
    );
  };

  // Map headers
  const productNameIdx = getColumnIndex(['product name', 'product', 'item']);
  const categoryIdx = getColumnIndex(['catalogue', 'category', 'type']);
  const subcategoryIdx = getColumnIndex(['sub-category', 'subcategory', 'module', 'description']);
  const priceIdx = getColumnIndex(['our price', 'price', 'unit price', 'mrp']);
  const wattageIdx = getColumnIndex(['wattage', 'power', 'watts']);
  const notesIdx = getColumnIndex(['notes', 'technical', 'features']);
  const vendorIdx = getColumnIndex(['vendor', 'make', 'manufacturer']);
  const protocolIdx = getColumnIndex(['protocol', 'connection']);

  console.log('📊 Column mapping:', {
    productNameIdx,
    categoryIdx,
    subcategoryIdx,
    priceIdx,
    wattageIdx,
    notesIdx,
    vendorIdx,
    protocolIdx,
  });

  // Process data rows
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];

    if (!row.length || row.every(cell => !cell.trim())) {
      continue; // Skip empty rows
    }

    try {
      const productName = row[productNameIdx]?.trim() || '';
      const category = row[categoryIdx]?.trim() || 'General';
      const subcategory = row[subcategoryIdx]?.trim() || 'Other';
      const priceStr = row[priceIdx]?.trim() || '0';
      const wattageStr = row[wattageIdx]?.trim();
      const notes = row[notesIdx]?.trim() || null;
      const vendor = row[vendorIdx]?.trim();
      const protocol = row[protocolIdx]?.trim();

      // Validate required fields
      if (!productName) {
        warnings.push(`Row ${i + 1}: Missing product name, skipping`);
        continue;
      }

      // Parse price
      const price = parseFloat(priceStr.replace(/[₹,]/g, '')) || 0;
      if (price <= 0) {
        warnings.push(`Row ${i + 1}: Invalid price "${priceStr}", using 0`);
      }

      // Parse wattage
      let wattage: number | null = null;
      if (wattageStr) {
        wattage = parseFloat(wattageStr.replace(/[^\d.]/g, '')) || null;
      }

      const item: ParsedInventoryItem = {
        product_name: productName,
        category,
        subcategory,
        price_per_unit: price,
        wattage,
        notes,
        vendor,
        protocol,
      };

      items.push(item);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: items.length > 0,
    items,
    errors,
    warnings,
    totalRows: csvData.length - 1,
    validRows: items.length,
  };
};

/**
 * Read file and return content as string
 */
export const readFileAsString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Process inventory file (CSV or Excel)
 * Returns parsed inventory items
 */
export const processInventoryFile = async (file: File): Promise<CSVParseResult> => {
  try {
    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      return {
        success: false,
        items: [],
        errors: ['Invalid file type. Please upload a CSV or Excel file.'],
        warnings: [],
        totalRows: 0,
        validRows: 0,
      };
    }

    console.log('📁 Processing file:', file.name);

    // Read file content
    const content = await readFileAsString(file);

    // Parse CSV
    const csvData = parseCSV(content);

    // Extract inventory data
    const result = extractInventoryData(csvData);

    console.log('✅ File processed:', {
      totalRows: result.totalRows,
      validRows: result.validRows,
      errors: result.errors.length,
      warnings: result.warnings.length,
    });

    return result;
  } catch (error) {
    console.error('❌ Error processing file:', error);
    return {
      success: false,
      items: [],
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      warnings: [],
      totalRows: 0,
      validRows: 0,
    };
  }
};
