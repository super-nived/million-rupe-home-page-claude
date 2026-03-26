const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create order on backend
export const createOrder = async ({ pixelCount, selection, adData }) => {
  // Transform to match backend expectations
  const payload = {
    pixels: pixelCount,
    label: adData.label,
    owner: adData.owner,
    bx: selection.bx,
    by: selection.by,
    bw: selection.bw,
    bh: selection.bh,
    color: adData.color,
    url: adData.url,
  };

  const response = await fetch(`${FUNCTIONS_URL}/createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
};

// Verify payment on backend
export const verifyPayment = async (paymentData) => {
  const response = await fetch(`${FUNCTIONS_URL}/verifyPayment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment verification failed');
  }

  return response.json();
};

// Open Razorpay checkout
export const initiatePayment = async ({
  pixelCount,
  amount,
  selection,
  adData,
  onSuccess,
  onFailure
}) => {
  try {
    // Load Razorpay
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay');
    }

    // Create order
    const { orderId, amount: orderAmount, currency, keyId } = await createOrder({
      pixelCount,
      selection,
      adData,
    });

    // Open Razorpay checkout
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderAmount,
      currency,
      name: 'PixelLakh',
      description: `Purchase ${pixelCount} pixels`,
      order_id: orderId,
      handler: async (response) => {
        try {
          // Verify payment
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (result.success) {
            onSuccess && onSuccess(result);
          } else {
            onFailure && onFailure(new Error('Payment verification failed'));
          }
        } catch (error) {
          onFailure && onFailure(error);
        }
      },
      prefill: {
        name: adData?.title || '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#FFD700',
      },
      modal: {
        ondismiss: () => {
          onFailure && onFailure(new Error('Payment cancelled'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onFailure && onFailure(error);
  }
};
