
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Logo className="mb-6" />
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">Page not found</p>
      <p className="text-center text-muted-foreground mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to the dashboard.
      </p>
      <Button
        className="bg-zing-600 hover:bg-zing-700"
        onClick={() => navigate("/")}
      >
        Return to Home
      </Button>
    </div>
  );
};

export default NotFound;
