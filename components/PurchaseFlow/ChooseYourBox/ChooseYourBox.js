import { useEffect, useRef } from 'react'
import ResponsiveImage from '@/components/ResponsiveImage'
import { nacelleClient } from 'services'
import { PortableText } from '@portabletext/react'
import classes from './ChooseYourBox.module.scss'
import ContentSections from '@/components/ContentSections'
import PurchaseFlowHeader from '../PurchaseFlowHeader'
import { usePurchaseFlowContext } from '@/context/PurchaseFlowContext'
import { usePDPDrawerContext } from '@/context/PDPDrawerContext'

const ChooseYourBox = ({props}) => {

  const purchaseFlowContext = usePurchaseFlowContext()
  const PDPDrawerContext = usePDPDrawerContext()
  const inputRef = useRef()

  useEffect(() => {
    async function getTierOptions() {
      const products = await nacelleClient.products({
        handles: props.tiers.map(tier => tier.product)
      })
      purchaseFlowContext.setTierOptions(products)
    }
    if (!purchaseFlowContext.tierOptions.length) {
      getTierOptions()
    }
  }, [])

  return (
    <>
      <div className={classes['choose-your-box']}>
        <div className="container">
          <PurchaseFlowHeader props={props} />
          <div className={classes['choose-your-box__tiers']}>
            <ul className={classes['choose-your-box__tier-list']}>
              {!!purchaseFlowContext.tierOptions.length && !!props.tiers?.length && props.tiers.map(item => {
                const isPopular = item.markAsMostPopular
                const product = purchaseFlowContext.tierOptions.find(product => product.content.handle === item.product)
                const firstVariant = product.variants[0]
                return <li className={`${classes['choose-your-box__tier']}  ${isPopular ? classes['is-popular'] : ''} `} key={item._key}>
                          <div className={classes['choose-your-box__tier-container']}>
                            <div className={classes['choose-your-box__tier-image']} >
                              <ResponsiveImage
                                src={product.content.media[0].src}
                                alt={product.content.media[0].alt || product.content.title}
                                priority={true} />
                            </div>
                            <div className={classes['choose-your-box__tier-details']}>
                              <h2 className={`${classes['choose_your-box__tier-title']} h1`}>{product.content.title.replace('Subscription', '')}</h2>
                              <div className={`${classes['choose-your-box__tier-price-pounds']} secondary--body`}>
                                <span>${firstVariant.price} / box</span>
                                <span>{firstVariant.weight} lbs</span>
                              </div>
                              {item.product === 'premium-seafood-subscription-box' &&
                                <div className={classes['input-group']}>
                                  <input id="shellfish_free" type="checkbox" ref={inputRef} />
                                  <label htmlFor="shellfish_free">Shellfish Free</label>
                                </div>
                              }
                              <button
                                onClick={() => purchaseFlowContext.selectBox(product, inputRef.current.checked)}
                                className="btn salmon">
                                  {props.tierCtaText}
                              </button>
                            </div>
                            <div className={classes['choose-your-box__tier-details-footer']}>
                              <button
                                onClick={() => PDPDrawerContext.openDrawer(product)}
                                className="btn-link-underline">
                                  {props.tierDetailsText}
                              </button>
                            </div>
                          </div>
                      </li>
              })}
            </ul>
          </div>
          {props.tierContent &&
            <div className={`${classes['choose-your-box__tier-content']}`}>
              <PortableText value={props.tierContent} />
            </div>
          }
        </div>
      </div>
      <ContentSections sections={props.content} />
    </>
  )
}

export default ChooseYourBox