import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Automatically redirect to login page
  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Index;
