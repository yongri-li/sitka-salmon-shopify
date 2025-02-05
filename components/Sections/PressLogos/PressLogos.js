import React from 'react';
import Image from 'next/image';

import classes from './PressLogos.module.scss';

const PressLogos = ({ fields }) => {
  const { pressLogos } = fields;

  return (
    <div className={`${classes['logos']}`}>
        <div className={`${classes['logos__row']}`}>
           {pressLogos.map((logo) => {
              return (
                <div className={classes['logos__img']} key={logo.logo.asset.assetId}>
                    <Image
                        src={logo.logo.asset.url}
                        layout="fill"
                        objectFit='contain'
                        alt={logo.alt || 'press logo'}
                    />
                </div>
              )
           })}
        </div>
    </div>
  );
};

export default PressLogos;
