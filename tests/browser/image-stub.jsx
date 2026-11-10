/* eslint-disable @next/next/no-img-element */
import React from 'react';

export default function Image({ unoptimized, alt = '', ...props }) {
  void unoptimized;
  return <img alt={alt} {...props} />;
}
