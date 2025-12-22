import { cardActionRepository$ } from '@/repositories';
import { CardAction } from '@/repositories/schemas/card-action.schema';
import { useEffect, useState } from 'react';

export function useCardActions(cardType: 'credit' | 'debit' | 'virtual') {
  const [actions, setActions] = useState<CardAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchActions = async () => {
      try {
        setIsLoading(true);
        const repo = cardActionRepository$();
        const data = await repo.getActions(cardType);
        
        if (mounted) {
          setActions(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch card actions'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchActions();

    return () => {
      mounted = false;
    };
  }, [cardType]);

  return { actions, isLoading, error };
}
