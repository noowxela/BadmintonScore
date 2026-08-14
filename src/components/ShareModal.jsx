import React, { useEffect, useState } from 'react';
import { Camera, Link2, X } from 'lucide-react';

const QR_SIZE = 400;

const qrImageSrc = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=8&ecc=H&data=${encodeURIComponent(url)}`;

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Failed to load ${src}`));
  img.src = src;
});

const roundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const composeQrWithLogo = async (url, logoSrc) => {
  const qrImg = await loadImage(qrImageSrc(url));
  const canvas = document.createElement('canvas');
  canvas.width = QR_SIZE;
  canvas.height = QR_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
  ctx.drawImage(qrImg, 0, 0, QR_SIZE, QR_SIZE);

  if (logoSrc) {
    const logo = await loadImage(logoSrc);
    const maxW = QR_SIZE * 0.46;
    const maxH = QR_SIZE * 0.2;
    const ratio = logo.naturalWidth / logo.naturalHeight;
    let width = maxW;
    let height = width / ratio;
    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }
    const padX = 10;
    const padY = 8;
    const x = (QR_SIZE - width) / 2;
    const y = (QR_SIZE - height) / 2;
    roundRect(ctx, x - padX, y - padY, width + padX * 2, height + padY * 2, 10);
    ctx.fillStyle = '#0b1220';
    ctx.fill();
    ctx.drawImage(logo, x, y, width, height);
  }

  return canvas.toDataURL('image/png');
};

const ShareModal = ({ url, logo, title = 'BadmintonScore', fileName = 'qr.png', onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    composeQrWithLogo(url, logo)
      .then(dataUrl => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(qrImageSrc(url));
      });
    return () => {
      cancelled = true;
    };
  }, [url, logo]);

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = fileName;
    link.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <div className="bracket-modal" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <button type="button" className="rule-close share-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h3>{title}</h3>
        <div className="share-qr-wrap">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR code for ${url}`} />
          ) : (
            <div className="share-qr-loading">Loading QR…</div>
          )}
        </div>
        <button type="button" className="share-qr-btn" onClick={downloadQr} disabled={!qrDataUrl}>
          <Camera size={18} /> Share QR
        </button>
        <button type="button" className="share-copy-btn" onClick={copyLink}>
          <Link2 size={18} /> {copied ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
