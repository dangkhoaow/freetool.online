import React, { forwardRef } from 'react';

type ImageSource = string | { src: string };

type NextImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading'> & {
  src: ImageSource;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
};

function resolveImageSource(src: ImageSource): string {
  if (typeof src === 'string') {
    return src;
  }

  return src.src;
}

const Image = forwardRef<HTMLImageElement, NextImageProps>(function Image(
  { src, alt, fill, priority = false, style, ...rest },
  ref,
) {
  const resolvedSrc = resolveImageSource(src);
  const mergedStyle = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: (style as React.CSSProperties | undefined)?.objectFit || 'cover',
        ...(style || {}),
      }
    : style;

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      style={mergedStyle}
      {...rest}
    />
  );
});

export default Image;
