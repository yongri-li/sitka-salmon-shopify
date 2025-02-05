import React, { useEffect, useState } from "react"

import classes from './FeaturedText.module.scss'

const FeaturedText = ({ fields }) => {
    const { alignTextBlock, featuredTextSize, textAlign, smallTextTop, smallTextBottom, featuredText, topPadding, bottomPadding } = fields
    return (
        <div className={`${classes['featured-text']} container ${topPadding ? classes['top-padding'] : ''} ${bottomPadding ? classes['bottom-padding'] : ''}`}>
            <div className={`${classes['featured-text__inner']} ${alignTextBlock}`}>
                <div className={`${classes['text']} ${textAlign}`}>
                    {smallTextTop && <p className={`${classes['top-text']} secondary--body`}>{smallTextTop}</p>}
                    {featuredText && <h4 className={`${featuredTextSize === 'small-text' ? classes['small-text'] : ''}`}>{featuredText}</h4>}
                    {smallTextBottom && <p className={`${classes['bottom-text']} secondary--body`}>{smallTextBottom}</p>}
                </div>
            </div>
        </div>
    )
}

export default FeaturedText
