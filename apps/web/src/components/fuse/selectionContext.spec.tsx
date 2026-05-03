import { act, renderHook } from '@testing-library/react';
import {
  FusionSelectionProvider,
  MAX_FUSION_SELECTION,
  useFusionSelection,
} from './selectionContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FusionSelectionProvider>{children}</FusionSelectionProvider>
);

describe('FusionSelectionContext', () => {
  it('starts with an empty selection', () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    expect(result.current.count).toBe(0);
    expect(result.current.selected).toEqual([]);
  });

  it('selects a token id', () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    act(() => result.current.select(1n));
    expect(result.current.isSelected(1n)).toBe(true);
    expect(result.current.count).toBe(1);
  });

  it('deselects a previously selected id', () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    act(() => result.current.select(1n));
    act(() => result.current.deselect(1n));
    expect(result.current.isSelected(1n)).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('toggles selection', () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    act(() => result.current.toggle(1n));
    expect(result.current.isSelected(1n)).toBe(true);
    act(() => result.current.toggle(1n));
    expect(result.current.isSelected(1n)).toBe(false);
  });

  it(`refuses to select beyond ${MAX_FUSION_SELECTION}`, () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    act(() => {
      for (let i = 0n; i < BigInt(MAX_FUSION_SELECTION + 2); i++) {
        result.current.select(i);
      }
    });
    expect(result.current.count).toBe(MAX_FUSION_SELECTION);
  });

  it('clears the selection', () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    act(() => {
      result.current.select(1n);
      result.current.select(2n);
    });
    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
  });

  it('returns selected ids in deterministic insertion order', () => {
    const { result } = renderHook(() => useFusionSelection(), { wrapper });
    act(() => {
      result.current.select(3n);
      result.current.select(1n);
      result.current.select(2n);
    });
    expect(result.current.selected).toEqual([3n, 1n, 2n]);
  });

  it('throws if useFusionSelection is called outside its provider', () => {
    expect(() => renderHook(() => useFusionSelection())).toThrow(
      /FusionSelectionProvider/,
    );
  });
});
