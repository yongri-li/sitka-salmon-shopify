import React from 'react'
import EmailSignup from '@/components/EmailSignup'

const FooterTop = ({props, classes}) => {

  const { header, description } = props.emailSignup

  return (
    <div className={[classes.footerSection, classes.footerEmailSignup].join(' ')}>
      <div className={[classes.footerBlock, classes.footerEmailContent].join(' ')}>
        <h2 className={classes.footerEmailHeading}>{header}</h2>
        <p className={classes.footerEmailDescription}>{description}</p>
      </div>
      <div className={[classes.footerBlock, classes.footerEmailSignup].join(' ')}>
        <EmailSignup props={{
          ...props.emailSignup,
          listId: 'MuPGVv'
        }} />
      </div>
    </div>
  )
}

export default FooterTop