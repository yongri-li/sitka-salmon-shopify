import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../InputField';
import { SelectField } from '../SelectField';
// import './Address.css';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

export const Address = ({
  address,
  onChange,
  errors,
  countries,
  provinces,
  showPostalCode,
  showProvince,
  provinceLabel,
  submit,
  requiredAddressFields,
  className,
}) => {
  const countryList = countries.map((countryItem) => <option value={countryItem.iso_code} key={countryItem.iso_code}>{countryItem.name}</option>);
  const provinceList = provinces.map((provinceItem) => <option value={provinceItem.iso_code} key={provinceItem.iso_code}>{provinceItem.name}</option>);
  const hasRequiredFields = requiredAddressFields && requiredAddressFields.length;
  const errorMap = errors?.reduce((errors, error) => ({ ...errors, [error.field]: error.message }), {});
  const { t } = useTranslation();
  const provincePlaceholder = provinceLabel === 'state_territory' ? t('address.state_hint') : t('address.province_hint');
  const postalCodePlaceholder = provinceLabel === 'state_territory' ? t('address.zip_code') : t('address.postal_code');

  const handleSubmit = useCallback(() => {
    if (address && address.address_line_1 && address.city) {
      submit(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, submit]);

  // Submit address if user has stopped typing
  useEffect(() => {
    const postalCodeTimeout = setTimeout(() => {
      handleSubmit();
    }, 2000);
    return () => clearTimeout(postalCodeTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address?.first_name,
    address?.last_name,
    address?.business_name,
    address?.address_line_1,
    address?.address_line_2,
    address?.city,
    address?.country_code,
    address?.province_code,
    address?.postal_code,
    address?.phone_number,
    address?.id,
  ]);

  return (
    <div className={classNames('address-form' , className)}>
      <div className="input-group--wrapper">
        <InputField
          placeholder={hasRequiredFields && requiredAddressFields.includes('first_name') ? t('address.first_name') : t('address.first_name_optional')}
          type="text"
          name="first_name"
          autoComplete="given-name"
          className="input"
          value={address?.first_name ?? ''}
          messageType={errors && errorMap?.first_name && 'alert' || ''}
          messageText={errors && errorMap?.first_name && t('address.first_name_hint') || ''}
          onChange={(e) => onChange({
            first_name: e.target.value,
          })}
        />
        <InputField
          placeholder={hasRequiredFields && requiredAddressFields.includes('last_name') ? t('address.last_name') : t('address.last_name_optional')}
          type="text"
          name="last_name"
          autoComplete="family-name"
          className="input"
          value={address?.last_name ?? ''}
          messageType={errors && errorMap?.last_name && 'alert' || ''}
          messageText={errors && errorMap?.last_name && t('address.last_name_hint') || ''}
          onChange={(e) => onChange({
            last_name: e.target.value,
          })}
        />
      </div>
      <InputField
        placeholder={hasRequiredFields && requiredAddressFields.includes('business_name') ? t('address.business_name') : t('address.business_name_optional')}
        type="text"
        name="business_name"
        className="input"
        value={address?.business_name ?? ''}
        messageType={errors && errorMap?.business_name && 'alert' || ''}
        messageText={errors && errorMap?.business_name && t('address.business_name_hint') || ''}
        onChange={(e) => onChange({
          business_name: e.target.value,
        })}
      />
      <InputField
        placeholder={hasRequiredFields && requiredAddressFields.includes('address_line_1') ? t('address.address_line_1') : t('address.address_line_1_optional')}
        type="text"
        name="address_line_1"
        autoComplete="address_line1"
        className="input"
        value={address?.address_line_1 ?? ''}
        messageType={errors && errorMap?.address_line_1 && 'alert' || ''}
        messageText={errors && errorMap?.address_line_1 && t('address.address_line_1_hint') || ''}
        onChange={(e) => onChange({
          address_line_1: e.target.value,
        })}
      />
      <InputField
        placeholder={t('address.address_line_2')}
        type="text"
        name="address_line_2"
        autoComplete="address_line2"
        className="input"
        value={address?.address_line_2 ?? ''}
        onChange={(e) => onChange({
          address_line_2: e.target.value,
        })}
      />
      <InputField
        placeholder={hasRequiredFields && requiredAddressFields.includes('city') ? t('address.city') : t('address.city_optional')}
        type="text"
        name="city"
        autoComplete="address-level2"
        value={address?.city ?? ''}
        messageType={errors && errorMap?.city && 'alert' || ''}
        messageText={errors && errorMap?.city && t('address.city_hint') || ''}
        className="input"
        onChange={(e) => onChange({
          city: e.target.value,
        })}
      />
      <div className="input-group--wrapper display--none">
        <SelectField
          placeholder={t('address.country_hint')}
          name="country"
          autoComplete="country"
          className="input"
          value={address?.country_code ?? ''}
          messageType={errors && errorMap?.country && 'alert' || ''}
          messageText={errors && errorMap?.country && t('address.country_hint') || ''}
          onChange={(e) => onChange({
            country_code: e.value,
          })}
        >
          {countryList}
        </SelectField>
      </div>
      <div className="input-group--wrapper">
        <SelectField
            placeholder={provincePlaceholder}
            name="state"
            autoComplete="address-level1"
            className={classNames("input", !(address?.country_code && showProvince) && 'input--hidden')}
            value={address?.province_code ?? ''}
            messageType={errors && errorMap?.province && 'alert' || ''}
            messageText={errors && errorMap?.province && provincePlaceholder || ''}
            onChange={(e) => onChange({
              province: e.label,
              province_code: e.value,
            })}
          >
          {provinceList}
        </SelectField>
        <InputField
          placeholder={postalCodePlaceholder}
          type="text"
          name="postal"
          autoComplete="postal-code"
          className={classNames("input", !(address?.country_code && showPostalCode) && 'input--hidden')}
          messageType={errors && errorMap?.postal_code && 'alert' || ''}
          messageText={errors && errorMap?.postal_code}
          value={address?.postal_code ?? ''}
          onChange={(e) => onChange({
            postal_code: e.target.value,
          })}
        />
      </div>
      <InputField
        placeholder={hasRequiredFields && requiredAddressFields.includes('phone_number') ? t('address.phone_number') : t('address.phone_number_optional')}
        type="tel"
        name="phone_number"
        autoComplete="tel"
        className="input"
        value={address?.phone_number ?? ''}
        messageType={errors && errorMap?.phone_number && 'alert' || ''}
        messageText={errors && errorMap?.phone_number && t('address.phone_number_hint') || ''}
        onChange={(e) => onChange({
          phone_number: e.target.value,
        })}
      />
    </div>
  );
};

Address.propTypes = {
  address: PropTypes.any,
  onChange: PropTypes.func,
  errors: PropTypes.any,
  countries: PropTypes.any,
  provinces: PropTypes.any,
  showPostalCode: PropTypes.bool,
  showProvince: PropTypes.bool,
  provinceLabel: PropTypes.string,
  submit: PropTypes.func,
  requiredAddressFields: PropTypes.array,
};
