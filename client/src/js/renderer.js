import { slidesData } from './slides.js';
import { makeEditable, makeImageEditable } from './editor.js';

export function renderSlide(index, childIndex = -1, direction = 'none') {
    const slideContainer = document.getElementById("slide-container");
    const oldSlide = slideContainer.firstChild;

    if (!slidesData[index]) return;

    const slide = slidesData[index];
    const slideData = childIndex >= 0 ? slide.childs[childIndex] : slide;

    const slideDiv = document.createElement("div");
    slideDiv.classList.add("slide");

    const title = document.createElement("div");
    title.innerHTML = slideData.title;
    title.classList.add("slide-title");
    makeEditable(title, 'title', index, childIndex);

    const content = document.createElement("div");
    content.innerHTML = slideData.content;
    content.classList.add("slide-content-content");
    makeEditable(content, 'content', index, childIndex);

    if (slideData.image) {
        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("image-wrapper");

        const image = document.createElement("img");

        if (slideData.image.startsWith('data:image')) {
            image.src = slideData.image;
        } else {
            image.src = `data:image/png;base64,${slideData.image}`;
        }

        image.classList.add("slide-image");

        makeImageEditable(image, index, childIndex);
        imageWrapper.appendChild(image);
        slideDiv.appendChild(imageWrapper);
    }

    slideDiv.appendChild(title);
    slideDiv.appendChild(content);


    if (['left', 'right', 'up', 'down'].includes(direction)) {
        slideDiv.classList.add(`slide-in-${direction}`);

        if (oldSlide !== null) {
            const outDirection = direction === 'left' ? 'right' :
                direction === 'right' ? 'left' :
                    direction === 'up' ? 'up' : 'down';

            oldSlide.classList.add(`slide-out-${outDirection}`);
            oldSlide.addEventListener('animationend', () => oldSlide.remove());
        }
    }

    slideContainer.appendChild(slideDiv);
}
