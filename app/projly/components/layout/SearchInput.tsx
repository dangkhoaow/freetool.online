
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';

export const SearchInput = () => {
  const [open, setOpen] = useState(false);
  const { searchQuery, setSearchQuery, results, isSearching } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="border border-input w-[200px] md:w-[300px] relative justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search projects and tasks...</span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search projects and tasks..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
          autoFocus
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Spinner className="h-4 w-4 mr-2" />
                <span>Searching...</span>
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {results.length > 0 && (
            <>
              <CommandGroup heading="Projects">
                {results
                  .filter(item => item.type === 'project')
                  .map(item => (
                    <CommandItem 
                      key={item.id}
                      onSelect={() => handleSelect(item.path)}
                    >
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))
                }
              </CommandGroup>
              
              <CommandGroup heading="Tasks">
                {results
                  .filter(item => item.type === 'task')
                  .map(item => (
                    <CommandItem 
                      key={item.id}
                      onSelect={() => handleSelect(item.path)}
                    >
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))
                }
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
