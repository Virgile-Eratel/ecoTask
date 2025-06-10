import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

// Hook générique pour les appels API avec gestion d'état
export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setError: setGlobalError } = useStore();

  const execute = useCallback(async (apiCall: () => Promise<any>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setGlobalError(null);

    try {
      const response = await apiCall();
      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Erreur inconnue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setGlobalError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setGlobalError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Hook pour les listes avec pagination
export function useApiList<T>() {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setError: setGlobalError } = useStore();

  const fetchItems = useCallback(async (apiCall: () => Promise<any>): Promise<T[]> => {
    setLoading(true);
    setError(null);
    setGlobalError(null);

    try {
      const response = await apiCall();
      if (response.success && response.data) {
        const { pagination: paginationData, ...data } = response.data;
        const itemsArray = Object.values(data)[0] as T[];
        
        setItems(itemsArray);
        if (paginationData) {
          setPagination(paginationData);
        }
        return itemsArray;
      } else {
        throw new Error(response.error?.message || 'Erreur inconnue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setGlobalError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setGlobalError]);

  const addItem = useCallback((item: T) => {
    setItems(prev => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      (item as any).id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => (item as any).id !== id));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    setError(null);
    setLoading(false);
  }, []);

  return {
    items,
    pagination,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    removeItem,
    reset,
  };
}

// Hook pour les mutations (create, update, delete)
export function useApiMutation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setError: setGlobalError } = useStore();

  const mutate = useCallback(async (
    apiCall: () => Promise<any>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setGlobalError(null);

    try {
      const response = await apiCall();
      if (response.success) {
        if (onSuccess && response.data) {
          onSuccess(response.data);
        }
        return response.data || null;
      } else {
        throw new Error(response.error?.message || 'Erreur inconnue');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      setGlobalError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [setGlobalError]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, reset };
}

// Hook pour charger des données au montage du composant
export function useApiData<T>(
  apiCall: () => Promise<any>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setError: setGlobalError } = useStore();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setGlobalError(null);

      try {
        const response = await apiCall();
        if (isMounted) {
          if (response.success && response.data) {
            setData(response.data);
          } else {
            throw new Error(response.error?.message || 'Erreur inconnue');
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
          setError(errorMessage);
          setGlobalError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setGlobalError(null);

    apiCall()
      .then(response => {
        if (response.success && response.data) {
          setData(response.data);
        } else {
          throw new Error(response.error?.message || 'Erreur inconnue');
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite';
        setError(errorMessage);
        setGlobalError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiCall, setGlobalError]);

  return { data, loading, error, refetch };
}
