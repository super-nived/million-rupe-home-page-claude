import { useCallback, useMemo, useRef, useState } from 'react';
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
  const [purchaseStage, setPurchaseStage] = useState(null);

  const selection = useMemo(
    () => computeSelection(selA, selB, ads),
    [selA, selB, ads]
  );

  const purchase = useCallback(() => {
    if (!selection?.free) {
      notify('This area overlaps with an existing ad — pick a different spot', 'err');
      return;
    }
    if (selection.px < MIN_PIXELS) {
      notify(`Select at least ${MIN_PIXELS} pixel (${fmtRupees(MIN_PIXELS)}) to purchase`, 'err');
      return;
    }
    if (!form.label.trim()) {
      notify('Give your ad a name to continue', 'err');
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

    const hasImage = !!imageFileRef.current;

    const onProgress = (stage, message) => {
      setPurchaseStage(stage);
      if (stage === 'done') {
        // Don't show 'done' as progress — the success toast handles it
        return;
      }
      if (stage === 'warning') {
        notify(message, 'warning');
        return;
      }
      notify(message, 'progress');
    };

    mutation.mutate(
      { adData, imageFile: imageFileRef.current, onProgress },
      {
        onSuccess: (result) => {
          setPurchaseStage(null);
          const pixels = selection.px.toLocaleString();
          const price = fmtRupees(selection.px);
          const imgNote = hasImage && result.imageUrl ? ' with image' : hasImage ? ' (image pending)' : '';
          notify(`${pixels} pixels purchased for ${price}${imgNote}!`, 'ok');
          imageFileRef.current = null;
          dispatch(resetPurchase());
        },
        onError: (err) => {
          setPurchaseStage(null);
          const message = err.message || 'Something went wrong';
          notify(`Purchase failed — ${message}`, 'err');
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
    purchaseStage,
  };
}
