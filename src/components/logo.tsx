import {Clapperboard} from 'lucide-react';

export function Logo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <Clapperboard className="h-5 w-5" />
    </div>
  );
}
