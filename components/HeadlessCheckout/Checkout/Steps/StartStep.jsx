import React, { useCallback, useEffect, useState } from 'react';
import {
  useShippingAddress,
  useCheckoutStore
} from '@boldcommerce/checkout-react-components';
import { useAnalytics, useErrorLogging } from '@/hooks/index.js';
import {
  OrderErrors,
  Customer,
  ShippingAddress,
  BillingAddress,
  ShippingLines,
  PaymentMethod,
  CheckoutButton,
  OrderSummary
} from '../..';
import { useTranslation } from 'react-i18next';

const IndexPage = () => {
  const { state } = useCheckoutStore();
  const { submitShippingAddress } = useShippingAddress();
  const trackEvent = useAnalytics();
  const logError = useErrorLogging();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const setDefaultAddress = useCallback(async () => {
    setLoading(true);
    try {
      await submitShippingAddress(
        state.applicationState.customer.saved_addresses[0]
      );
    } catch (e) {
      logError('shipping_address', e);
      setLoading(false);
    }
    setLoading(false);
  }, [state, logError, submitShippingAddress]);

  useEffect(() => {
    // If customer is logged in with saved addresses, default the shipping address to the first one.
    if (state.applicationState.customer.saved_addresses.length > 0) {
      setDefaultAddress();
    }

    trackEvent('landing_page');
  }, [
    setDefaultAddress,
    state.applicationState.customer.saved_addresses,
    trackEvent
  ]);

  return (
    <>
      <div className="Checkout__Layout Checkout__Main" role="main">
        <OrderSummary />
        <OrderErrors />
        <Customer />
        <ShippingAddress applicationLoading={loading} />
        <BillingAddress applicationLoading={loading} />
        <ShippingLines applicationLoading={loading} />
        <PaymentMethod applicationLoading={loading} />
        <div className="Checkout__Navigation">
          <CheckoutButton />
          <a className="Checkout__ReturnLink" href={process.env.CART_URL}>
            {t('return_to_cart')}
          </a>
        </div>
        {/* <div className="Checkout__Footer">
          <p className="Checkout__Rights">{`All rights reserved ${t('website_name')}`}</p>
        </div> */}
      </div>
    </>
  );
};

export default IndexPage;
