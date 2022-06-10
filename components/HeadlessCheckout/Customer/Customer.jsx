import React, { memo, useCallback, useState } from 'react';
import { useCustomer } from '@boldcommerce/checkout-react-components';
// import { CheckboxField } from "@boldcommerce/stacks-ui/lib";
import { InputField } from '../InputField';
import { CheckoutSection } from '../CheckoutSection';
// import './Customer.css';
import { useAnalytics, useErrorLogging } from '@/hooks/index.js';
import { useTranslation } from 'react-i18next';

const Customer = () => {
  const { data, submitCustomer } = useCustomer();

  return <MemoizedCustomer customer={data} submitCustomer={submitCustomer} />;
};

const MemoizedCustomer = memo(({ customer, submitCustomer }) => {
  const trackEvent = useAnalytics();
  const logError = useErrorLogging();
  const [email, setEmail] = useState(customer?.email_address);
  const [errors, setErrors] = useState(null);
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const { t } = useTranslation();
  //console.log("customer", customer);

  const handleSubmit = useCallback(async () => {
    try {
      await submitCustomer({
        email_address: email,
        accepts_marketing: acceptsMarketing
      });
      trackEvent('set_customer');
      setErrors(null);
    } catch (e) {
      setErrors(e.body.errors);
      logError('customer', e);
    }
  }, [email, acceptsMarketing, logError, submitCustomer, trackEvent]);

  return (
    <CheckoutSection
      className="FieldSet--CustomerInformation"
      title={t('customer.info')}
    >
      {customer?.email_address ? (
        <div className="FieldSet--CustomerEmail">
          <div>{customer.email_address}</div>
          <div>
            {t('customer.not_you')}
            <a href={process.env.LOGIN_URL}>{t('customer.logout')}</a>
          </div>
        </div>
      ) : (
        <>
          <div>
            {t('customer.already_have_account')}
            <a href={process.env.LOGIN_URL}>{t('customer.login')}</a>
          </div>
          <InputField
            className="Field--Email"
            placeholder={t('customer.email')}
            type="email"
            name="email"
            autoComplete="email"
            messageType={errors && 'alert'}
            messageText={errors && errors[0].message}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={customer.isAuthenticated}
            onBlur={handleSubmit}
          />
        </>
      )}
      <input
        type="checkbox"
        label={t('customer.subscribe')}
        checked={acceptsMarketing}
        onChange={() => setAcceptsMarketing(!acceptsMarketing)}
      />
    </CheckoutSection>
  );
});

export default Customer;
