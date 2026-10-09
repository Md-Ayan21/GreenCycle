import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainContent = document.querySelector(
      "main"
    );

    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;