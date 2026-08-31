import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="not-found page-rail">
      <span>404</span>
      <h1>We couldn’t find that page.</h1>
      <p>The page may have moved or may not yet be published.</p>
      <Link className="button" to="/">
        Return home
      </Link>
    </section>
  );
}
