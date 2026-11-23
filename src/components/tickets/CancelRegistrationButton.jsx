import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { cancelEventRegistration } from '../../services/eventService.js';

export function CancelRegistrationButton({ eventId, onCancelled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function cancel() {
    if (busy || !window.confirm('Deseja cancelar sua inscrição neste evento?')) return;
    setBusy(true);
    setError('');
    try {
      const result = await cancelEventRegistration(eventId);
      await onCancelled(result);
    } catch (err) {
      setError(err.message || 'Não foi possível cancelar a inscrição.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button className="public-event-detail__button cancel-registration-button" type="button" disabled={busy} onClick={cancel}>
      <XCircle size={18} aria-hidden="true" />
      {busy ? 'Cancelando...' : 'Cancelar inscrição'}
    </button>
    {error && <p role="alert">{error}</p>}
  </>;
}
