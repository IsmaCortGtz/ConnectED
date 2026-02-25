import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './carousel.scss';

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlayDelay?: number;
}

export default function ImageCarousel({ images, autoPlayDelay = 5000 }: ImageCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = ((page % images.length) + images.length) % images.length;

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayDelay);

    return () => clearInterval(timer);
  }, [page]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const goToSlide = (index: number) => {
    const newDirection = index > imageIndex ? 1 : -1;
    const diff = index - imageIndex;
    setPage([page + diff, newDirection]);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0
    })
  };

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="carousel-slide"
          >
            <img src={images[imageIndex].src} alt={images[imageIndex].alt} />
            {images[imageIndex].caption && (
              <motion.div 
                className="carousel-caption"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {images[imageIndex].caption}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <button className="carousel-button prev" onClick={() => paginate(-1)}>
          ‹
        </button>
        <button className="carousel-button next" onClick={() => paginate(1)}>
          ›
        </button>
      </div>

      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === imageIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
