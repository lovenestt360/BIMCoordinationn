import { useEffect } from 'react';
import { X } from 'lucide-react';

const ImageLightbox = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="image-lightbox"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
      >
        <X size={20} />
      </button>
      <div className="max-w-6xl w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.caption} className="max-w-full max-h-[78vh] object-contain rounded-sm" />
        {image.caption && (
          <p className="text-white/70 text-sm font-light mt-4 text-center max-w-2xl">{image.caption}</p>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
