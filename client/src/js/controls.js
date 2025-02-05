import { renderSlide } from './renderer.js';
import { slidesData, getCurrentSlide, setCurrentSlide } from './slides.js';

export function setupControls() {
    document.getElementById("prev-btn").addEventListener("click", () => {
        if (getCurrentSlide() > 0) {
            setCurrentSlide(getCurrentSlide() - 1);
            renderSlide(getCurrentSlide(), -1, 'left');
        }
    });

    document.getElementById("next-btn").addEventListener("click", () => {
        if (getCurrentSlide() < slidesData.length - 1) {
            setCurrentSlide(getCurrentSlide() + 1);
            renderSlide(getCurrentSlide(), -1, 'right');
        }
    });
}
