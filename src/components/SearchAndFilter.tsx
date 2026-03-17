import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from './ui/select';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from './ui/popover';
import { 
  Search, Filter, X, SlidersHorizontal,
  Download, ArrowUpDown
} from 'lucide-react';
import { Label } from './ui/label';

export interface FilterConfig {
  status?: string;
  hostingType?: string;
  tierId?: string;
  minFee?: number;
  maxFee?: number;
  serverType?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  sortConfig: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  filterOptions?: {
    statuses?: string[];
    hostingTypes?: string[];
    tiers?: Array<{ id: number; name: string }>;
    serverTypes?: string[];
  };
  sortFields?: Array<{ value: string; label: string }>;
  onExport?: () => void;
  placeholder?: string;
}

export function SearchAndFilter({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
  filterOptions = {},
  sortFields = [],
  onExport,
  placeholder = 'Search...',
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters);

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && v !== '' && v !== null
  ).length;

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterConfig = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsFilterOpen(false);
  };

  const handleRemoveFilter = (key: keyof FilterConfig) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-3">
      {/* Search and Actions Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-5 h-5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filters</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="h-auto p-1"
                >
                  Clear all
                </Button>
              </div>

              {filterOptions.statuses && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={localFilters.status || ''}
                    onValueChange={(value) => 
                      setLocalFilters({ ...localFilters, status: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      {filterOptions.statuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterOptions.hostingTypes && (
                <div className="space-y-2">
                  <Label>Hosting Type</Label>
                  <Select
                    value={localFilters.hostingType || ''}
                    onValueChange={(value) => 
                      setLocalFilters({ ...localFilters, hostingType: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {filterOptions.hostingTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterOptions.tiers && (
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select
                    value={localFilters.tierId?.toString() || ''}
                    onValueChange={(value) => 
                      setLocalFilters({ ...localFilters, tierId: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All tiers</SelectItem>
                      {filterOptions.tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id.toString()}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterOptions.serverTypes && (
                <div className="space-y-2">
                  <Label>Server Type</Label>
                  <Select
                    value={localFilters.serverType || ''}
                    onValueChange={(value) => 
                      setLocalFilters({ ...localFilters, serverType: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {filterOptions.serverTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(filterOptions.statuses || filterOptions.hostingTypes) && (
                <>
                  <div className="space-y-2">
                    <Label>Min Monthly Fee</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={localFilters.minFee || ''}
                      onChange={(e) => 
                        setLocalFilters({ 
                          ...localFilters, 
                          minFee: e.target.value ? parseFloat(e.target.value) : undefined 
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Monthly Fee</Label>
                    <Input
                      type="number"
                      placeholder="9999.99"
                      value={localFilters.maxFee || ''}
                      onChange={(e) => 
                        setLocalFilters({ 
                          ...localFilters, 
                          maxFee: e.target.value ? parseFloat(e.target.value) : undefined 
                        })
                      }
                    />
                  </div>
                </>
              )}

              <Button onClick={handleApplyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {sortFields.length > 0 && (
          <Select
            value={`${sortConfig.field}-${sortConfig.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split('-');
              onSortChange({ field, direction: direction as 'asc' | 'desc' });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortFields.flatMap((field) => [
                  <SelectItem key={`${field.value}-asc`} value={`${field.value}-asc`}>
                    {field.label} (A-Z)
                  </SelectItem>,
                  <SelectItem key={`${field.value}-desc`} value={`${field.value}-desc`}>
                    {field.label} (Z-A)
                  </SelectItem>,
              ])}
            </SelectContent>
          </Select>
        )}

        {onExport && (
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={() => handleRemoveFilter('status')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {filters.hostingType && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Type: {filters.hostingType}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={() => handleRemoveFilter('hostingType')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {filters.tierId && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Tier: {filterOptions.tiers?.find(t => t.id.toString() === filters.tierId)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={() => handleRemoveFilter('tierId')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {filters.serverType && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Server: {filters.serverType}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={() => handleRemoveFilter('serverType')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {filters.minFee !== undefined && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Min: R{filters.minFee}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={() => handleRemoveFilter('minFee')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {filters.maxFee !== undefined && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Max: R{filters.maxFee}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={() => handleRemoveFilter('maxFee')}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}