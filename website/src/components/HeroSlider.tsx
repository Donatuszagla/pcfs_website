import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { SiteData } from "../types";

export interface HeroSliderProps {
  data: SiteData;
}

export function HeroSlider({ data }: HeroSliderProps) {
  const backgroundImages = useMemo(
    () => [
      "/images/0.jpg",
      "/images/1.jpg",
      "/images/2.jpg",
      "/images/3.jpg",
      "/images/4.jpg",
      "/images/5.jpg",
      "/images/6.jpg",
      "/images/7.jpg",
      "/images/8.jpg",
      "/images/9.jpg",
    ],
    []
  );

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % backgroundImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  return (
    <section className="hero-slider" aria-label="Welcome Hero Slideshow">
      {backgroundImages.map((image, index) => (
        <div key={image} className={index === current ? "hero-slide active" : "hero-slide"}>
          <div className="hero-bg" style={{ backgroundImage: `url('${image}')` }} />
          <div className="hero-overlay" />
        </div>
      ))}
      <div className="hero-content page-rail">
        <h1>
          Welcome to
          <br />
          Paradise City of
          <br />
          Faith Sanctuary
        </h1>
        <p className="hero-subtitle">{data.settings.description}</p>
        <div className="button-row">
          <Link className="button" to="/contact">
            Plan a Visit
          </Link>
          <Link className="button button-outline" to="/about">
            Explore PCFS
          </Link>
        </div>
      </div>
    </section>
  );
}
