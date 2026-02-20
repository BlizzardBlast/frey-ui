import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import styles from './avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'offline' | 'idle' | 'dnd';

export type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
};

const SizeClassMap: Record<AvatarSize, string> = {
  sm: styles.avatar_sm,
  md: styles.avatar_md,
  lg: styles.avatar_lg
};

const StatusClassMap: Record<AvatarStatus, string> = {
  online: styles.avatar_status_online,
  offline: styles.avatar_status_offline,
  idle: styles.avatar_status_idle,
  dnd: styles.avatar_status_dnd
};

const useImageLoadingStatus = (src?: string) => {
  const [loadingStatus, setLoadingStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');

  useEffect(() => {
    if (!src) {
      setLoadingStatus('error');
      return;
    }

    let isMounted = true;
    const image = new globalThis.Image();

    const updateStatus = (status: 'loaded' | 'error') => {
      if (!isMounted) return;
      setLoadingStatus(status);
    };

    setLoadingStatus('loading');
    image.onload = () => updateStatus('loaded');
    image.onerror = () => updateStatus('error');
    image.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return loadingStatus;
};

const Avatar = React.forwardRef<HTMLSpanElement, Readonly<AvatarProps>>(
  function Avatar(
    { src, alt, fallback, size = 'md', status, className, ...props },
    ref
  ) {
    const imageLoadingStatus = useImageLoadingStatus(src);

    return (
      <span
        ref={ref}
        className={clsx(styles.avatar, SizeClassMap[size], className)}
        {...props}
      >
        {imageLoadingStatus === 'loaded' && src ? (
          <img src={src} alt={alt} className={styles.avatar_image} />
        ) : (
          <span className={styles.avatar_fallback}>{fallback}</span>
        )}

        {status && (
          <span
            className={clsx(
              styles.avatar_status_indicator,
              StatusClassMap[status]
            )}
            title={status}
          />
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
