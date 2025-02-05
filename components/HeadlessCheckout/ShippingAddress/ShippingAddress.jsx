import React, { memo, useCallback, useEffect, useState } from 'react';
import { useCountryInfo, useLoadingStatus, useShippingAddress, useShippingLines } from '@boldcommerce/checkout-react-components';
import { Address } from '@/components/HeadlessCheckout/Address';
import { SavedAddressList } from './components';
import { useAnalytics, useErrorLogging } from '@/hooks/index.js';
import { useTranslation } from 'react-i18next';
import { useHeadlessCheckoutContext } from '@/context/HeadlessCheckoutContext';
import { useCustomerContext } from '@/context/CustomerContext';

const ShippingAddress = ({ applicationLoading }) => {

  const requiredAddressFields = ['first_name', 'last_name', 'address_line_1', 'city'];
  const { data: shippingAddress, submitShippingAddress } = useShippingAddress(requiredAddressFields);
  const { data } = useShippingLines();
  const { data: loadingStatus } = useLoadingStatus();
  const setting = loadingStatus.shippingAddress === 'setting';

  return (
    <MemoizedShippingAddress
      shippingAddress={shippingAddress}
      shippingLines={data.shippingLines}
      submitAddress={submitShippingAddress}
      setting={setting}
      applicationLoading={applicationLoading}
      requiredAddressFields={requiredAddressFields}
    />
  );
};

const MemoizedShippingAddress = memo(({
  shippingAddress,
  shippingLines,
  submitAddress,
  setting,
  applicationLoading,
  requiredAddressFields,
}) => {
  const [loading, setLoading] = useState(false);
  const trackEvent = useAnalytics();
  const logError = useErrorLogging();
  const [address, setAddress] = useState(Array.isArray(shippingAddress) ? {'country_code': 'US'} : shippingAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const { data } = useCountryInfo(address);
  const [addressOpen, setAddressOpen] = useState(true);
  const {
    countries,
    provinces,
    showProvince,
    showPostalCode,
    provinceLabel,
  } = data;
  const [errors, setErrors] = useState(null);
  const { t } = useTranslation();
  const { refreshShipOptionData } = useHeadlessCheckoutContext();
  const { customer } = useCustomerContext();

  let provincePlaceholder = provinceLabel;

  const updateSelectedShippingAddress = useCallback(async (currentAddress) => {

    if (currentAddress && currentAddress.city && currentAddress.address_line_1) {
      currentAddress.country_code = 'US'
    }

    setAddress(currentAddress);
    setLoading(true);
    try {
      await submitAddress(currentAddress);
      await refreshShipOptionData(currentAddress.postal_code);
      trackEvent('set_shipping_address');
      setErrors(null);
    } catch(e) {
      logError('shipping_address', e);
      setErrors(e.body.errors);
      // If there is a server error, reset shipping address
      if (e.body.errors[0].field === 'order') {
        setAddress(shippingAddress);
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress]);

  useEffect(() => {
    setAddress(Array.isArray(shippingAddress) ? {'country_code': 'US'} : shippingAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Add Customer data if logged in
    const getSavedAddresses = async (customerId) => {
      const response = await fetch(`${process.env.checkoutUrl}/api/checkout/customer-addresses/`, {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      })
      return await response.json()
    }
    if (customer && customer.id) {
      getSavedAddresses(customer.id.replace('gid://shopify/Customer/', ''))
        .then(res => {
          if (res?.length) {
            setSavedAddresses([...res])
          }
        })
    } else {
      // TODO: for some reason, these next two lines are causing the component not to render or something in tests - ZJ
      setSavedAddresses([])
      setAddress({'country_code': 'US'})
      if (shippingLines?.length > 0) {
        updateSelectedShippingAddress({'country_code': 'US'})
      }
    }
  }, [customer])

  return (
    <div className="order-address">
      <div className={`checkout__header checkout__header--border-on-closed checkout__row ${addressOpen ? 'checkout__header--open' : 'checkout__header--closed'}`}>
        <h3>{t('shipping.address')}</h3>
      </div>
      <SavedAddressList
        savedAddresses={savedAddresses}
        selectedAddress={applicationLoading ? savedAddresses[0].id : address?.id}
        onChange={updateSelectedShippingAddress}
        disabled={loading || applicationLoading || setting}
      />
      { addressOpen && !applicationLoading && (address?.id === undefined || address?.id === null) && (
        <Address
          className={(savedAddresses && savedAddresses.length > 0) ? 'FieldSet--AddressNew' : ''}
          address={address}
          onChange={(data) => {
            setAddress((prevAddress) => ({
            ...prevAddress,
            ...data,
          }
          ))}}
          errors={errors}
          countries={countries}
          provinces={provinces}
          showPostalCode={showPostalCode}
          showProvince={true}
          provinceLabel={provincePlaceholder}
          submit={() => updateSelectedShippingAddress(address)}
          requiredAddressFields={requiredAddressFields}
        />
      )}
    </div>
  );
});

export default ShippingAddress