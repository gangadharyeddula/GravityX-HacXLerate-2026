import { useState } from 'react';

export default function PortfolioMedia({ item, className = 'h-48 w-full object-cover' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const mediaUrl = item.media_url || '';
  const isVideo = /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(mediaUrl);
  const isBehanceEmbed = /^https:\/\/www-ccv\.adobe\.io\/v1\/player\/ccv\/.+\/embed(?:[?#]|$)/i.test(mediaUrl);

  if (isBehanceEmbed) {
    return <iframe className={`${className} bg-black`} src={mediaUrl} title={`${item.title} on Behance`} loading="lazy" allow="fullscreen" />;
  }

  if (isVideo) {
    return (
      <video className={`${className} bg-black`} controls preload="metadata" poster={item.thumbnail_url || undefined}>
        <source src={mediaUrl} />
        Your browser does not support video playback.
      </video>
    );
  }

  const imageUrl = item.thumbnail_url || mediaUrl;
  if (!imageUrl || imageFailed) {
    return (
      <a href={item.source_url} target="_blank" rel="noreferrer" className={`${className} flex items-center justify-center bg-[var(--ct-panel)] p-6 text-center text-sm font-medium text-[var(--ct-teal)]`}>
        Open public work on {item.source_platform || 'creator source'} ↗
      </a>
    );
  }

  return <img src={imageUrl} alt={item.title} className={className} loading="lazy" onError={() => setImageFailed(true)} />;
}
