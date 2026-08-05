import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaStar,
  FaSearch,
  FaClock,
  FaMotorcycle
} from "react-icons/fa";

import "./Hero.css";
import HeroData from "./Herodata";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

function Hero() {

    return (

    <section id="home" className="hero">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false
        }}
        pagination={{
          clickable: true
        }}
        loop={true}
        className="heroSwiper"
      >
        {

                    heroData.map((item)=>(

                        <SwiperSlide key={item.id}>

                            <div
                                className="hero-slide"
                                style={{
                                    backgroundImage:`url(${item.image})`
                                }}
                            >

                                <div className="overlay"></div>

                                <div className="hero-container">

                                    <div className="hero-content">

    <div className="location">

        <FaMapMarkerAlt />

        <span>Deliver to Panna, Madhya Pradesh</span>

    </div>

    <h4>Madhuram Cafe</h4>

    <h1>
        {item.title.split("\n").map((line,index)=>

            <span key={index}>
                {line}
                <br/>
            </span>

        )}
    </h1>

    <h3>{item.subtitle}</h3>

    <p>{item.description}</p>


</div>

                                </div>
<div className="floating-cards">

    <div className="glass-card">

        <FaStar className="gold"/>

        <div>

            <h3>4.9 Rating</h3>

            <p>5000+ Happy Customers</p>

        </div>

    </div>

    <div className="glass-card">

        <FaClock className="gold"/>

        <div>

            <h3>25 Minutes</h3>

            <p>Average Delivery</p>

        </div>

    </div>

    <div className="glass-card">

        <FaMotorcycle className="gold"/>

        <div>

            <h3>Free Delivery</h3>

            <p>Above ₹499</p>

        </div>

    </div>

</div>
                            </div>

                        </SwiperSlide>

                    ))

                }

            </Swiper>

        </section>

    );

}

export default Hero;
