import React from "react";
import { FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";

import "./Hero.css";
import heroData from "./HeroData";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

function Hero() {
  return (
    <section id="home" className="hero-section">
      {/* Delivery location header bar matching the image */}
      <div className="hero-location-bar">
        <FaMapMarkerAlt className="location-icon" />
        <span>Deliver to: <strong>Panna Madhya Pradesh</strong></span>
        <span className="location-arrow">▾</span>
      </div>

      {/* Main hero card banner slider */}
      <div className="hero-banner-container">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="heroSwiper"
        >
          {heroData.map((item) => (
            <SwiperSlide key={item.id}>
              <div
                className="hero-slide-card"
                style={{
                  backgroundImage: `url(${item.image})`,
                }}
              >
                <div className="hero-card-overlay"></div>

                <div className="hero-card-content">
                  <h1 className="hero-title">
                    {item.title.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </h1>

                  <p className="hero-script-subtitle">{item.scriptSubtitle}</p>

                  <p className="hero-description">{item.description}</p>

                  <button className="hero-order-btn" type="button">
                    <span>{item.buttonText}</span>
                    <FaChevronRight className="btn-icon" />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default Hero;

