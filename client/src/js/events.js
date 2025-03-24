import { renderSlide } from './renderer.js';
import {
    getCurrentSlide,
    setCurrentSlide,
    getCurrentChildIndex,
    setCurrentChildIndex,
    addSlide, getSlides
} from './slides.js';
import {sendEvent} from "./wsclient";
import {isEditorMode} from "./editor";

export function setupEventListeners() {

    const btnAddRight = document.getElementById('add-right')
    btnAddRight.addEventListener("click", (e) => {
        addSlide("right")
    })
    const btnAddBottom = document.getElementById('add-down')
    btnAddBottom.addEventListener("click", (e) => {
        addSlide("down")
    })

    document.addEventListener("keydown", (event) => {
        if (isEditorMode) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            sendEvent(event)
            setCurrentChildIndex(-1);

            if (event.key === "ArrowLeft") {

                if (getCurrentSlide() > 0) {
                    setCurrentSlide(getCurrentSlide() - 1);
                    renderSlide(getCurrentSlide(), getCurrentChildIndex(), 'left');
                }
            } else {
                console.log('zeiger',getSlides(),getCurrentSlide(), getSlides.length - 1,(getCurrentSlide() < getSlides().length - 1))
                if (getCurrentSlide() < getSlides().length - 1) {
                    setCurrentSlide(getCurrentSlide() + 1);
                    renderSlide(getCurrentSlide(), getCurrentChildIndex(), 'right');
                }
            }
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            const currentSlideData = getSlides()[getCurrentSlide()];
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
