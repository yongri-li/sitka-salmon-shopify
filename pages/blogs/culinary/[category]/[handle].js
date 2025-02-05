import { useRef, useEffect, useState } from 'react'
import { useModalContext } from '@/context/ModalContext'
import ArticleSplitHero from '@/components/Article/ArticleSplitHero'
import ArticleMain from '@/components/Article/ArticleMain'
import { nacelleClient } from 'services'
import { GET_PRODUCTS } from '@/gql/index.js'
import ContentSections from '@/components/Sections/ContentSections'
import PageSEO from '@/components/SEO/PageSEO'
import StructuredData from '@/components/SEO/StructuredData'
import { getNacelleReferences } from '@/utils/getNacelleReferences'
import { getRecentArticlesHandles } from '@/utils/getRecentArticleHandles'
import { useCustomerContext } from '@/context/CustomerContext'
import moment from 'moment'

const RecipeArticle = ({ page, products, blogSettings, modals }) => {

  const { setContent } = useModalContext()
  const mainContentRef = useRef()

  const modalContext = useModalContext()
  const [mounted, setMounted] = useState(false)
  const customerContext = useCustomerContext()
  const { customer } = customerContext

  let datePublished = moment.unix(page.createdAt).format('MMMM DD, YYYY')
  if (page.fields?.publishedDate) {
    datePublished = moment(page.fields.publishedDate).format('MMMM DD, YYYY')
  }

  const { hero, articleTags, displayTags } = page.fields
  if (displayTags) {
    hero.tags = displayTags
  }
  const blogType = page.fields.blog?.blogType
  const blogGlobalSettings = blogSettings ? { ...blogSettings.fields[blogType], blogType} : undefined
  hero.header = page.title
  hero.subheader = page.fields.subheader

  useEffect(() => {
    if (page.type === 'liveCookingClassArticle') {
      setContent({
        header: page.title,
        classStartDate: page.fields.classStartDate,
        classEndDate: page.fields.classEndDate,
        listId: page.fields.klaviyoListId
      })
    }

    setMounted(true)

    if (!articleTags) {
      return
    }

    const foundVisibleTags = articleTags.reduce((carry, tag) => {
      if (tag.value.toLowerCase().includes('visible')) {
        const splitTag = tag.value.split(':')[1].trim()
        const splitTagWithoutDash = splitTag?.replace(/-/g, '').replace(/ /g, '').toLowerCase()
        return [...carry, splitTagWithoutDash]
      }
      return carry
    }, [])

    const articleHasCustomerTag = customer?.tags.some(tag => {
      const customerTagWithoutDash = tag.replace(/-/g, '').toLowerCase()
      return foundVisibleTags.some(tag => customerTagWithoutDash.indexOf(tag) > -1)
    })

    modalContext.setArticleCustomerTag(articleHasCustomerTag)

    const hierarchy = [
      'kingsustainer',
      'sockeyesustainer',
      'prepaid',
      'member'
    ]

    const foundModal = modals.reduce((carry, modal) => {
      const modalHandleWithoutDash = modal.handle.replace(/-/g, '')
      if (foundVisibleTags.some(tag => tag.indexOf(modalHandleWithoutDash) > -1)) {
        if (!carry.handle) return modal
        if (hierarchy.indexOf(modalHandleWithoutDash) < hierarchy.indexOf(carry.handle.replace(/-/g, ''))) {
          return modal
        }
      }
      return carry
    }, {})

    // if product tags exist but none of the product tags match customer tag
    if(foundVisibleTags.length > 0 && !articleHasCustomerTag && foundModal.fields) {
      modalContext.setContent(foundModal.fields)
      modalContext.setModalType('gated_product')
      modalContext.setIsOpen(true)
    }

    if (modalContext.modalType === 'gated_product') {
      // if one of the product tags contains customer tag
      if(foundVisibleTags.length > 0 && articleHasCustomerTag) {
        modalContext.setIsOpen(false)
      }

      // if visible tags dont exist
      if(foundVisibleTags.length === 0) {
        modalContext.setIsOpen(false)
      }
    }

  }, [customer, modalContext.isOpen])

  if (page.type === 'recipeArticle') {
    return (
      <>
        <StructuredData type="article" data={page} />
        <StructuredData type="recipe" data={page} />
        <PageSEO seo={page.fields.seo} />
        <ArticleSplitHero fields={hero} renderType="recipe" blogGlobalSettings={blogGlobalSettings} />
        <ArticleMain contentType="recipe" showNav={true} fields={page.fields} datePublished={datePublished} products={products} blogGlobalSettings={blogGlobalSettings} />
        <ContentSections sections={page.fields.pageContent} />
      </>
    )
  }

  if (page.type === 'videoArticle') {
    return (
      <>
        <StructuredData type="article" data={page} />
        <PageSEO seo={page.fields.seo} />
        <ArticleSplitHero fields={hero} renderType="default" blogGlobalSettings={blogGlobalSettings} />
        <ArticleMain contentType="standard" fields={page.fields} datePublished={datePublished} products={products} blogGlobalSettings={blogGlobalSettings} />
        <ContentSections sections={page.fields.pageContent} />
      </>
    )
  }

  if (page.type === 'cookingGuideArticle') {

    const hasVideo = hero.youtubeVideoId ? true : false

    return (
      <div className={`${!hasVideo ? 'article-cooking-guide--no-video' : 'article-cooking-guide'}`}>
        <StructuredData type="article" data={page} />
        <StructuredData type="video" data={page} />
        <PageSEO seo={page.fields.seo} />
        <ArticleSplitHero ref={mainContentRef} fields={hero} renderType="cooking-guide" blogGlobalSettings={blogGlobalSettings} />
        <ArticleMain ref={mainContentRef} contentType="standard" fields={page.fields} datePublished={datePublished} products={products} showNav={true} blogGlobalSettings={blogGlobalSettings} />
        <ContentSections sections={page.fields.pageContent} />
      </div>
    )
  }

  if (page.type === 'liveCookingClassArticle') {

    hero.classStartDate = page.fields?.classStartDate
    hero.classEndDate = page.fields?.classEndDate

    if (page.fields?.sidebar?.classSignup && page.fields.klaviyoListId) {
      page.fields.sidebar.classSignup.klaviyoListId = page.fields.klaviyoListId
    }

    return (
      <>
        <StructuredData type="article" data={page} />
        <StructuredData type="video" data={page} />
        <PageSEO seo={page.fields.seo} />
        <ArticleSplitHero fields={hero} renderType="cooking-class" blogGlobalSettings={blogGlobalSettings} />
        <ArticleMain contentType="standard" fields={page.fields} datePublished={datePublished} products={products} blogGlobalSettings={blogGlobalSettings} />
        <ContentSections sections={page.fields.pageContent} />
      </>
    )
  }

  // else return standard article
  return (
    <>
      <StructuredData type="article" data={page} />
      <PageSEO seo={page.fields.seo} />
      <ArticleSplitHero fields={hero} renderType="default" blogGlobalSettings={blogGlobalSettings} />
      <ArticleMain contentType="standard" fields={page.fields} datePublished={datePublished} products={products} blogGlobalSettings={blogGlobalSettings} />
      <ContentSections sections={page.fields.pageContent} />
    </>
  )

}

export default RecipeArticle

export async function getStaticPaths() {

  const standardArticles = await nacelleClient.content({
    type: 'standardArticle',
    entryDepth: 1
  })

  const recipeArticles = await nacelleClient.content({
    type: 'recipeArticle',
    entryDepth: 1
  })

  const cookingGuideArticles = await nacelleClient.content({
    type: 'cookingGuideArticle',
    entryDepth: 1
  })

  const liveCookingClassArticles = await nacelleClient.content({
    type: 'liveCookingClassArticle',
    entryDepth: 1
  })

  const videoArticles = await nacelleClient.content({
    type: 'videoArticle',
    entryDepth: 1
  })

  const validArticles = [...standardArticles, ...recipeArticles, ...cookingGuideArticles, ...liveCookingClassArticles, ...videoArticles].reduce((carry, article) => {
    // only get culinary categories
    const blogType = article.fields.blog.blogType
    if (blogType === 'culinary') {
      return [...carry, {
        category: article.fields.blog.handle.current,
        handle: article.handle
      }]
    }
    return carry
  }, [])

  const handles = validArticles.map((article) => {
    return {
      params: {
        handle: article.handle,
        category: article.category
      }
    }
  })

  return {
    paths: handles,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {

  const { category, handle } = params

  const pages = await nacelleClient.content({
    handles: [handle],
    entryDepth: 1
  })

  if (!pages.length || !pages[0].fields.published) {
    return {
      notFound: true
    }
  }

  const fullRefPages = await getNacelleReferences(pages)

  const validPage = fullRefPages.find((page) => {
    return page.fields?.blog?.handle.current === category
  })

  if (!validPage) {
    return {
      notFound: true
    }
  }

  if (validPage?.fields?.pageContent?.some(content => content._type === 'featuredBlogContent')) {
    await getRecentArticlesHandles(validPage.fields.pageContent)
  }

  const blogSettings = await nacelleClient.content({
    type: 'blogSettings'
  })

  const modals = await nacelleClient.content({
    type: 'gatedArticleModal'
  })

  const props = {
    page: validPage,
    handle: validPage.handle,
    blogSettings: blogSettings[0],
    product: null,
    modals: modals
  }

  if (validPage.fields?.content) {
    const handles = validPage.fields.content.filter(item => item._type === 'productBlock').map(item => item.product)
    if (handles.length) {
      let data = await nacelleClient.query({
        query: GET_PRODUCTS,
        variables: {
          "filter": {
            "handles": [...handles]
          }
        }
      })
      if (data.products && data.products.length) {
        props.products = data.products
      }
    }
  }

  return {
    props
  }
}
