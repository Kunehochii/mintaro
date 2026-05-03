import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const MAX_FUSION_SELECTION = 5;

export interface FusionSelectionApi {
  selected: bigint[];
  count: number;
  isSelected: (id: bigint) => boolean;
  isFull: boolean;
  select: (id: bigint) => void;
  deselect: (id: bigint) => void;
  toggle: (id: bigint) => void;
  clear: () => void;
}

const Ctx = createContext<FusionSelectionApi | null>(null);

export function FusionSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<bigint[]>([]);

  const isSelected = useCallback(
    (id: bigint) => selected.some((x) => x === id),
    [selected],
  );

  const select = useCallback((id: bigint) => {
    setSelected((prev) => {
      if (prev.some((x) => x === id)) return prev;
      if (prev.length >= MAX_FUSION_SELECTION) return prev;
      return [...prev, id];
    });
  }, []);

  const deselect = useCallback((id: bigint) => {
    setSelected((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: bigint) => {
    setSelected((prev) => {
      if (prev.some((x) => x === id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_FUSION_SELECTION) return prev;
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const api = useMemo<FusionSelectionApi>(
    () => ({
      selected,
      count: selected.length,
      isSelected,
      isFull: selected.length >= MAX_FUSION_SELECTION,
      select,
      deselect,
      toggle,
      clear,
    }),
    [selected, isSelected, select, deselect, toggle, clear],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useFusionSelection(): FusionSelectionApi {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      'useFusionSelection must be used inside <FusionSelectionProvider>',
    );
  }
  return ctx;
}
