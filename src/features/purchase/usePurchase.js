import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelection, resetPurchase, updateForm } from './purchaseSlice';
import { usePurchaseAd } from '../ads/useAds';
import { computeSelection } from '../../utils/gridHelpers';
import { fmtRupees } from '../../utils/formatters';
import { MIN_PIXELS } from '../../constants/grid';

export function usePurchase(ads, notify) {
  const dispatch = useDispatch();
  const { selA, selB, form } = useSelector((s) => s.purchase);
  const mutation = usePurchaseAd();

  const selection = useMemo(
    () => computeSelection(selA, selB, ads),
    [selA, selB, ads]
  );

  const purchase = useCallback(() => {
    if (!selection?.free) {
      notify('Area is occupied!', 'err');
      return;
    }
    if (selection.px < MIN_PIXELS) {
      notify(`Minimum ${MIN_PIXELS} pixels (₹${MIN_PIXELS}) required!`, 'err');
      return;
    }
    if (!form.label.trim()) {
      notify('Enter an ad name!', 'err');
      return;
    }

    const ad = {
      id: Date.now(),
      bx: selection.bx,
      by: selection.by,
      bw: selection.bw,
      bh: selection.bh,
      color: form.color,
      label: form.label.trim(),
      url: form.url.trim() || '#',
      owner: form.owner.trim() || 'Anonymous',
      ...(form.image && { image: form.image }),
    };

    mutation.mutate(ad);
    notify(`Purchased ${selection.px.toLocaleString()} pixels for ${fmtRupees(selection.px)}!`);
    dispatch(resetPurchase());
  }, [dispatch, selection, form, mutation, notify]);

  const clearArea = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const setFormField = useCallback(
    (field, value) => {
      dispatch(updateForm({ [field]: value }));
    },
    [dispatch]
  );

  const setImage = useCallback(
    (imageData) => {
      dispatch(updateForm({ image: imageData }));
    },
    [dispatch]
  );

  return { selection, purchase, clearArea, setFormField, setImage, form };
}
