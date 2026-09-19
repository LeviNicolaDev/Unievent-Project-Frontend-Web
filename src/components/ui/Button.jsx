import { Link } from 'react-router-dom';

export function Button({ children, to, icon: Icon, variant = 'primary', className = '', ...props }) {
  const classNames = `ui-button ui-button--${variant} ${className}`.trim();
  const content = (
    <>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classNames} {...props}>
      {content}
    </button>
  );
}
