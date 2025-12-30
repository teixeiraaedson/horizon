import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(180deg, var(--bg0) 0%, var(--bg1) 100%)",
      }}
    >
      <div className="surface-1 card-sheen card-hover w-full max-w-md p-8 text-center">
        <div className="text-5xl font-bold tracking-tight mb-2">404</div>
        <p className="text-sm text-muted-foreground mb-6">
          Oops! Page not found
        </p>

        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                     border border-[color:var(--borderA)]
                     bg-[rgba(56,189,248,0.10)]
                     hover:bg-[rgba(56,189,248,0.14)]
                     text-[var(--textA)]
                     transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
