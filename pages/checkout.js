import CheckoutContent from '@/components/HeadlessCheckout/Checkout/CheckoutContent'
import { usePurchaseFlowContext } from '@/context/PurchaseFlowContext'
import { useHeadlessCheckoutContext} from '@/context/HeadlessCheckoutContext'

const CheckoutPage = () => {
  const purchaseFlowContext = usePurchaseFlowContext()
  const { data } = useHeadlessCheckoutContext()

  if (!purchaseFlowContext.options.is_loaded) {
    return ''
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <CheckoutContent data={data} />
      </div>
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      handle: 'checkout'
    }
  }
}


export default CheckoutPage