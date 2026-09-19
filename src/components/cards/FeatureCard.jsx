import { Link } from 'react-router-dom';

export function FeatureCard({ to, image, icon: Icon, title, description, className = '' }) {
  return (
    <Link to={to} className={`feature-card ${className}`.trim()}>
      {image ? <img src={image} alt="" /> : Icon ? <Icon size={48} aria-hidden="true" /> : null}
      <span>{title}</span>
      {description ? <small>{description}</small> : null}
    </Link>
  );
}
