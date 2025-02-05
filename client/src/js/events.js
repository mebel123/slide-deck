import { renderSlide } from './renderer.js';
import { slidesData, getCurrentSlide, setCurrentSlide, getCurrentChildIndex, setCurrentChildIndex } from './slides.js';
import {sendEvent} from "./wsclient";

export function setupEventListeners() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            sendEvent(event)
            setCurrentChildIndex(-1);

            if (event.key === "ArrowLeft") {

                if (getCurrentSlide() > 0) {
                    setCurrentSlide(getCurrentSlide() - 1);
                    renderSlide(getCurrentSlide(), getCurrentChildIndex(), 'left');
                }
            } else {
                if (getCurrentSlide() < slidesData.length - 1) {
                    setCurrentSlide(getCurrentSlide() + 1);
                    renderSlide(getCurrentSlide(), getCurrentChildIndex(), 'right');
                }
            }
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            const currentSlideData = slidesData[getCurrentSlide()];
            if (!currentSlideData.childs || currentSlideData.childs.length === 0) return;

            if (event.key === "ArrowUp") {
                setCurrentChildIndex(Math.max(-1, getCurrentChildIndex() - 1));
                renderSlide(getCurrentSlide(), getCurrentChildIndex(), 'down');
            } else {
                setCurrentChildIndex(Math.min(currentSlideData.childs.length - 1, getCurrentChildIndex() + 1));
                renderSlide(getCurrentSlide(), getCurrentChildIndex(), 'up');
            }
        }
    });
}
