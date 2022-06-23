import classes from './MainNavigation.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import PrimaryNavigation from './PrimaryNavigation'
import NavigationUtilities from './NavigationUtilities'
import PurchaseFlowNavigation from './PurchaseFlowNavigation'

const MainNavigation = ({props, pageHandle}) => {

  let navigationType

  if (pageHandle === 'purchase-flow' || 'checkout') {
    navigationType = pageHandle
  }

  return (
    <nav className={`${classes.mainNavigation} ${navigationType ? classes[navigationType] : '' }`}>
      <div className={`${classes.mainNavContainer} container`}>
        {pageHandle !== 'purchase-flow' &&
          <PrimaryNavigation props={props} classes={classes} />
        }
        <div className={classes.navLogo}>
          <div className={classes.navLogoContainer}>
            <Link href="/">
              <a>
                <Image src={props.logo.asset.url} width={136} height={84} alt={props.logo.asset.alt || 'Logo'} />
              </a>
            </Link>
          </div>
        </div>
        {pageHandle === 'purchase-flow' &&
          <PurchaseFlowNavigation />
        }
        <NavigationUtilities props={props} classes={classes} />
      </div>
    </nav>
  )
}

export default MainNavigation