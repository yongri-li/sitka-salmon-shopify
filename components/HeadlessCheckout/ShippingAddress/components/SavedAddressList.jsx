// import RadioField from '@boldcommerce/stacks-ui/lib/components/radiofield/RadioField';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SavedAddress from './SavedAddress';
import { useTranslation } from 'react-i18next';

const SavedAddressList = ({
  savedAddresses,
  selectedAddress,
  disabled,
  onChange
}) => {
  const [prevAddress, setPrevAddress] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (selectedAddress) {
      setPrevAddress(selectedAddress);
    }
  }, [selectedAddress]);

  const lastSelectedAddress = useMemo(() => {
    if (prevAddress) {
      return savedAddresses.find((address) => address.id === prevAddress);
    } else {
      return savedAddresses[0];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevAddress]);

  const handleNewAddressChange = useCallback(() => {
    onChange({
      ...lastSelectedAddress,
      id: null
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSelectedAddress]);

  if (!savedAddresses || savedAddresses.length === 0) return null;

  const savedAddressList = savedAddresses.map((method, index) => {
    return (
      <div
        className="RadioButton RadioButton__AddressInfoContainer"
        key={index}
      >
        <input
          type="radio"
          label={<SavedAddress addressInfo={method} />}
          name="shipping-address"
          checked={selectedAddress === method.id}
          className="RadioField"
          onChange={() => {
            onChange(method);
          }}
          disabled={disabled}
        />
      </div>
    );
  });

  return (
    <>
      {savedAddressList}
      <div className="RadioButton RadioButton__NewAddressContainer">
        {/* <RadioField
          label={t('shipping.add_new_address')}
          name="shipping-address"
          checked={!selectedAddress}
          className="RadioField"
          onChange={handleNewAddressChange}
          disabled={disabled}
        /> */}
      </div>
    </>
  );
};

export default SavedAddressList;
