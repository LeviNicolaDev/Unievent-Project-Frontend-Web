import { X } from 'lucide-react';
import { Button } from './Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export function Modal({ open, title, message, image, confirmText = 'Confirmar', onClose, onConfirm }) {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
        {image ? <img src={image} alt="" className="modal-image" /> : null}
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <Button type="button" onClick={onConfirm}>{confirmText === 'Confirmar' ? t('confirm') : confirmText}</Button>
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
        </div>
      </div>
    </div>
  );
}
