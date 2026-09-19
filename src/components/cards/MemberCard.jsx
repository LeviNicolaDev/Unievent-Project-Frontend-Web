import github from '../../assets/images/github-logo.svg';
import linkedin from '../../assets/images/linkedin-logo.svg';

export function MemberCard({ photo, name, githubUrl, linkedinUrl }) {
  return (
    <article className="card-integrantes" aria-label={name}>
      <img src={photo} alt={name} />
      <div className="logo-images">
        <a href={githubUrl} target="_blank" rel="noreferrer"><img src={github} alt="logo-github" /></a>
        <a href={linkedinUrl} target="_blank" rel="noreferrer"><img src={linkedin} alt="logo-linkedin" /></a>
      </div>
    </article>
  );
}
