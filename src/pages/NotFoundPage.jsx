import { Button } from '../components/ui/Button.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import errorImage from '../assets/images/emoteError.png';

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <main className="not-found">
      <img src={errorImage} alt="" />
      <h1>404</h1>
      <p>{t('notFound')}</p>
      <Button to="/">{t('backHome')}</Button>
    </main>
  );
}
