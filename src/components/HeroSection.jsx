import React from 'react';
import '././css/HeroSection.css'
import '././css/Header.css'
const HeroSection = ({ t, onStartChat }) => {
  return (
    <section className="snap-section hero-section">
      <div className="hero-card">
        <h2>{t.heroTitle}</h2>
        <p>{t.heroSub}</p>
        <button className="hero-btn" onClick={onStartChat}>
          {t.heroBtn}
        </button>
      </div>
      <div className="swipe-up-indicator">
        <div className="bar"></div>
        <span>{t.swipeHint}</span>
      </div>
    </section>
  );
};

export default HeroSection;