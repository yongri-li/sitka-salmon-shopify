import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckoutSection } from '../CheckoutSection';
import { LineItems } from '../LineItems';
import { DiscountForm } from '../DiscountForm';
import { OrderSummaryBreakdown, OrderSummaryCollapseButton } from '.';
// import './OrderSummary.css';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

const OrderSummary = ({ readOnly }) => {
  const { t } = useTranslation();
  const [summaryOpen, setSummaryOpen] = useState(false);
  return (
    <div className="OrderSummary">
      <OrderSummaryCollapseButton onClick={() => setSummaryOpen((prevState) => !prevState)} summaryOpen={summaryOpen} />
      <CheckoutSection
        className={classNames(["FieldSet--OrderSummary", summaryOpen ? "FieldSet--OrderSummary--Open" : "FieldSet--OrderSummary--Closed"])}
        title={t('summary.title')}
      >
        <LineItems readOnly={readOnly} />
        { !readOnly && <DiscountForm /> }
        <OrderSummaryBreakdown />
      </CheckoutSection>
    </div>
  );
};

OrderSummary.propTypes = {
  readOnly: PropTypes.bool,
};

export default OrderSummary;
