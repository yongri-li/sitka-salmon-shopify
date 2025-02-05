import React, { useEffect, useState } from 'react'
import { useTheCatchContext } from '@/context/TheCatchContext'
import ContentSections from '@/components/Sections/ContentSections'
import PageSEO from '@/components/SEO/PageSEO'
import { nacelleClient } from 'services'
import { getNacelleReferences } from '@/utils/getNacelleReferences'
import { getRecentArticlesHandles } from '@/utils/getRecentArticleHandles'

const TheCatch = (props) => {
    const { page } = props
    const theCatchContext = useTheCatchContext()
    const { addIssue, addFilteredIssue, monthName } = theCatchContext

    useEffect(() => {
        const filtered = page.fields?.content?.filter(content => content._type === 'staticHarvest')
        const found = filtered.find(staticHarvest => staticHarvest.harvestMonth[0].month.toLowerCase() === monthName)

        addIssue(page)
        addFilteredIssue(found)
    }, [])

    return (
        <>
          <PageSEO seo={page.fields.seo} />
          <ContentSections sections={page.fields.content} />
        </>
    )
}

export default TheCatch

export async function getStaticPaths() {
    const theCatchPages = await nacelleClient.content({
        type: 'theCatch',
        entryDepth: 1
    })

    const handles = theCatchPages
      .filter((page) => (page.handle))
      .map((page) => ({ params: { handle: page.handle }}))

    return {
      paths: handles,
      fallback: 'blocking'
    }
}

export async function getStaticProps({ params }) {
    const pages = await nacelleClient.content({
      handles: [params.handle],
      type: 'theCatch',
      entryDepth: 1
    })

    if (!pages.length) {
      return {
        notFound: true
      }
    }

    const foundPage = pages.find(page => page.handle === params.handle)

    const fullRefPage = await getNacelleReferences(foundPage)

    if (fullRefPage?.fields?.content?.some(content => content._type === 'featuredBlogContent')) {
      await getRecentArticlesHandles(fullRefPage.fields.content)
    }

    return {
      props: {
        page: fullRefPage,
        extraPages: pages,
        handle: params.handle
      }
    }
}
