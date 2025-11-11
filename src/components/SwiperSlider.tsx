import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { ReactNode } from "react";

interface SwiperSliderProps {
  settings: any;
  children: ReactNode;
}

function SwiperSlider({settings, children}: SwiperSliderProps) {

  return (
     <Slider {...settings}>
        {children}
     </Slider>
  );
}

export default SwiperSlider;
