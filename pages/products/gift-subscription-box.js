import { useState, useEffect, createRef, useRef } from 'react'
import { nacelleClient } from 'services'
import ContentSections from '@/components/Sections/ContentSections'
import ProductReviewStars from '../../components/Product/ProductReviewStars'
import ProductSlider from '../../components/Product/ProductSlider'
import ProductGiftSubForm from '@/components/Product/ProductGiftSubForm'
import { GET_PRODUCTS } from '@/gql/index.js'
import PageSEO from '@/components/SEO/PageSEO'
import StructuredData from '@/components/SEO/StructuredData'
import ProductDetailsList from '@/components/Product/ProductDetailsList'
import ProductStamps from '@/components/Product/ProductStamps'
import classes from './Product.module.scss'
import { getNacelleReferences } from '@/utils/getNacelleReferences'
import { getRecentArticlesHandles } from '@/utils/getRecentArticleHandles'
import { getHarvests } from '@/utils/getHarvests'
import { getMetafield } from '@/utils/getMetafield'
import { dataLayerViewProduct } from '@/utils/dataLayer'
import { resetCalls } from 'react-ga'

function GiftSubscriptionBoxPDP({ page, products }) {

  const [product, setProduct] = useState(products[0])
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [harvestsLoading, setHarvestsLoading] = useState(false)
  const [harvests, setHarvests] = useState(null)
  const servingsMetafield = getMetafield({product, selectedVariant, key: 'servings'})

  const refs = useRef(['reviewsStars', 'productReviews'].reduce((carry, ref) => {
    return {
      ...carry,
      [ref]: createRef()
    }
  }, {}))

  const onSelectProduct = (e) => {
    const product = products.find(product => product.content.handle === e.value)
    setProduct(product)
  }

  useEffect(() => {
    setSelectedVariant(product.variants[0])
    setHarvestsLoading(true)
    getHarvests({product})
    .then(res => {
      if (res) {
        setHarvests(res)
        setHarvestsLoading(false)
      }
    })
    if (window && window.StampedFn) {
      StampedFn.init()
    }
    dataLayerViewProduct({product})
  }, [product])

  return (
    product && (
      <div className={`${classes['product']} ${classes['gift-subscription-product']} product gift-subscription-product`}>
        <StructuredData type="product" data={product} />
        <PageSEO product={product} seo={page.fields.seo} />
        <div className={classes['product__inner']}>
            <div className={`${classes['product__row']} container`}>

              <div className={classes['slider']}>
                <ProductSlider product={product} />
              </div>

              <div className={classes['main']}>
                <ProductReviewStars ref={refs} productId={product.sourceEntryId.replace('gid://shopify/Product/', '')} />

                {product.content?.title && <h1 className={classes['product-title']}>{product.content.title}</h1>}

                <div className={classes['prices']}>
                  <div className={classes['price-wrap']}>
                    {selectedVariant.compareAtPrice && (
                      <h2 className={classes.compare}>
                        ${selectedVariant.compareAtPrice}
                      </h2>
                    )}
                    <h2>${selectedVariant.price} / box</h2>
                  </div>
                  <h2 className={classes['weight']}>
                    {selectedVariant.weight} lbs
                    {servingsMetafield && <> / {servingsMetafield.value} servings</> }
                  </h2>
                </div>

                {/* PRODUCT FORM */}
                <ProductGiftSubForm selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} allProducts={products} product={product} onSelectProduct={onSelectProduct} />

                {!!product.boxDetails.fields.details &&
                  <ProductDetailsList enableToggle={true} expandOnLoad={true} fields={{
                    ...product.boxDetails.fields.details,
                    detailsItems: product.boxDetails.fields.details.detailsItems.filter(item => {
                      if (item.text && item.text[0].children[0].text.includes('money-back')) return false
                      if (item.text && item.text[0].children[0].text.includes('money back')) return false
                      return true
                    })
                  }} />
                }

                {!!product.boxDetails.fields.badges &&
                  <ProductStamps fields={product.boxDetails.fields.badges} product={product} />
                }

              </div>
            </div>
          {/* SECTIONS */}
          <ContentSections
            ref={refs}
            product={product}
            sections={page.fields.content}
            harvestsLoading={harvestsLoading}
            harvests={harvests &&
              harvests.filter(harvest => harvest.variantTitle === selectedVariant.content.title)
              .map(harvest => {
                return {
                  ...harvest,
                  header: harvest.variantTitle
                }
              })
            }
            disableHarvestFilters={true} />
        </div>
      </div>
    )
  )
}

export default GiftSubscriptionBoxPDP

export async function getStaticProps({ params }) {
  // Performs a GraphQL query to Nacelle to get product data,
  // using the handle of the current page.
  // (https://nacelle.com/docs/querying-data/storefront-sdk)

  const productHandles = ['salmon-subscription-box', 'premium-seafood-subscription-box', 'seafood-subscription-box']

  const { products } = await nacelleClient.query({
    query: GET_PRODUCTS,
    variables: {
      "filter": {
        "handles": productHandles
      }
    }
  })

  if (!products.length) {
    return {
      notFound: true
    }
  }

  const boxDetails = await nacelleClient.content({
    handles: productHandles,
    type: 'boxDetails'
  })

  const productsWithBoxInfo = products.map(product => {
    const boxInfo = boxDetails ? boxDetails.find(box => box.handle === product.content.handle) : {}
    return {
      ...product,
      boxDetails: boxInfo
    }
  })

  const page = await nacelleClient.content({
    handles: ['gift-subscription-product'],
    entryDepth: 1
  })

  const fullRefPage = await getNacelleReferences(page[0])

  if (fullRefPage?.fields?.content?.some(content => content._type === 'featuredBlogContent')) {
    await getRecentArticlesHandles(fullRefPage.fields.content)
  }

  return {
    props: {
      products: productsWithBoxInfo,
      page: fullRefPage
    }
  }
}