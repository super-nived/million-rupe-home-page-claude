import { useCallback, useMemo, useRef } from 'react';
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
  const imageFileRef = useRef(null);

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

    const adData = {
      bx: selection.bx,
      by: selection.by,
      bw: selection.bw,
      bh: selection.bh,
      color: form.color,
      label: form.label.trim(),
      url: form.url.trim() || '#',
      owner: form.owner.trim() || 'Anonymous',
    };

    mutation.mutate(
      { adData, imageFile: imageFileRef.current },
      {
        onSuccess: () => {
          notify(`Purchased ${selection.px.toLocaleString()} pixels for ${fmtRupees(selection.px)}!`);
          imageFileRef.current = null;
          dispatch(resetPurchase());
        },
        onError: (err) => {
          notify(err.message || 'Purchase failed!', 'err');
        },
      }
    );
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
    (file) => {
      if (file) {
        imageFileRef.current = file;
        const previewUrl = URL.createObjectURL(file);
        dispatch(updateForm({ image: previewUrl }));
      } else {
        imageFileRef.current = null;
        dispatch(updateForm({ image: null }));
      }
    },
    [dispatch]
  );

  return {
    selection,
    purchase,
    clearArea,
    setFormField,
    setImage,
    form,
    isPurchasing: mutation.isPending,
  };
}
