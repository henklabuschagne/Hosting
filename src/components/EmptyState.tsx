import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Database, Users, Server, FileQuestion, 
  Search, Filter, Inbox, AlertCircle 
} from 'lucide-react';

interface EmptyStateProps {
  icon?: 'database' | 'users' | 'server' | 'search' | 'filter' | 'inbox' | 'error';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  database: Database,
  users: Users,
  server: Server,
  search: Search,
  filter: Filter,
  inbox: Inbox,
  error: AlertCircle,
};

export function EmptyState({ 
  icon = 'inbox', 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-6">{description}</p>
          
          {action && (
            <div className="flex gap-3">
              <Button onClick={action.onClick}>
                {action.label}
              </Button>
              {secondaryAction && (
                <Button variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function NoSearchResults({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description="We couldn't find any items matching your search. Try adjusting your filters or search terms."
      action={{
        label: 'Clear Search',
        onClick: onClear,
      }}
    />
  );
}

export function NoDataYet({ 
  entityName, 
  onCreate 
}: { 
  entityName: string; 
  onCreate?: () => void;
}) {
  return (
    <EmptyState
      icon="inbox"
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.toLowerCase()}.`}
      action={onCreate ? {
        label: `Create ${entityName}`,
        onClick: onCreate,
      } : undefined}
    />
  );
}

export function ErrorState({ 
  title = 'Something went wrong',
  description = 'We encountered an error loading this data. Please try again.',
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      icon="error"
      title={title}
      description={description}
      action={{
        label: 'Try Again',
        onClick: onRetry,
      }}
    />
  );
}
