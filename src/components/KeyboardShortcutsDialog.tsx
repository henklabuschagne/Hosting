import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Keyboard } from 'lucide-react';
import { KeyboardShortcut, getShortcutDisplay } from '../hooks/useKeyboardShortcuts';

interface ShortcutsGroup {
  title: string;
  shortcuts: KeyboardShortcut[];
}

interface KeyboardShortcutsDialogProps {
  groups: ShortcutsGroup[];
}

export function KeyboardShortcutsDialog({ groups }: KeyboardShortcutsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="size-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {groups.map((group, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="outline" className="font-mono">
                      {getShortcutDisplay(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <p>Press <Badge variant="outline" className="mx-1">?</Badge> to open this dialog</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
