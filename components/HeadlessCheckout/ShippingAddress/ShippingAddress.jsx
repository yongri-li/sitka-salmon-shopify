import React, { memo, useCallback, useEffect, useState } from 'react';
import { useCountryInfo, useLoadingStatus, useSavedAddresses, useShippingAddress } from '@boldcommerce/checkout-react-components';
import { Address } from '@/components/HeadlessCheckout/Address';
import { SavedAddressList } from './components';
// import './ShippingAddress.css';
import { useAnalytics, useErrorLogging } from '@/hooks/index.js';
import { useTranslation } from 'react-i18next';

const ShippingAddress = ({ applicationLoading }) => {
  const requiredAddressFields = ['first_name', 'last_name', 'address_line_1', 'city'];
  const { data: shippingAddress, submitShippingAddress } = useShippingAddress(requiredAddressFields);
  const { data: savedAddresses } = useSavedAddresses();
  const { data: loadingStatus } = useLoadingStatus();
  const setting = loadingStatus.shippingAddress === 'setting';

  return (
    <MemoizedShippingAddress
      shippingAddress={shippingAddress}
      submitAddress={submitShippingAddress}
      savedAddresses={savedAddresses}
      setting={setting}
      applicationLoading={applicationLoading}
      requiredAddressFields={requiredAddressFields}
    />
  );
};

const MemoizedShippingAddress = memo(({
  shippingAddress,
  submitAddress,
  savedAddresses,
  setting,
  applicationLoading,
  requiredAddressFields,
}) => {
  const [loading, setLoading] = useState(false);
  const trackEvent = useAnalytics();
  const logError = useErrorLogging();
  const [address, setAddress] = useState(shippingAddress);
  const { data } = useCountryInfo(address);
  const {
    countries,
    provinces,
    showProvince,
    showPostalCode,
    provinceLabel,
  } = data;
  const [errors, setErrors] = useState(null);
  const { t } = useTranslation();

  let provincePlaceholder = provinceLabel;

  useEffect(() => {
    setAddress(shippingAddress);
  }, [shippingAddress.id]);

  const updateSelectedShippingAddress = useCallback(async (currentAddress) => {
    setAddress(currentAddress);
    setLoading(true);
    try {
      await submitAddress(currentAddress);
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
  }, [shippingAddress]);

  return (
    <div>
      <h3>{t('shipping.address')}</h3>
      <SavedAddressList
        savedAddresses={savedAddresses}
        selectedAddress={applicationLoading ? savedAddresses[0].id : address?.id}
        onChange={updateSelectedShippingAddress}
        disabled={loading || applicationLoading || setting}
      />
      { !applicationLoading && (address?.id === undefined || address?.id === null) && (
        <Address
          className={(savedAddresses && savedAddresses.length > 0) ? 'FieldSet--AddressNew' : ''}
          address={address}
          onChange={(data) => setAddress((prevAddress) => ({
            ...prevAddress,
            ...data,
          }))}
          errors={errors}
          countries={countries}
          provinces={provinces}
          showPostalCode={showPostalCode}
          showProvince={showProvince}
          provinceLabel={provincePlaceholder}
          submit={() => updateSelectedShippingAddress(address)}
          requiredAddressFields={requiredAddressFields}
        />
      )}
    </div>
  );
});

export default ShippingAddress