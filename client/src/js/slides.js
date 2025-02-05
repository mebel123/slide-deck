export let slidesData = [];

let _currentSlide = 0;
let _currentChildIndex = -1;

export function getCurrentSlide() {
    return _currentSlide;
}

export function setCurrentSlide(value) {
    _currentSlide = value;
}

export function getCurrentChildIndex() {
    return _currentChildIndex;
}

export function setCurrentChildIndex(value) {
    _currentChildIndex = value;
}

export function createDefaultSlide() {
    return {
        title: "New Slide",
        titleStyle: '{"text-align":"center"}',
        content: "Add your content here",
        contentStyle: '{"text-align":"left"}',
        image: null,
        childs: []
    };
}

export async function loadSlides() {
    try {
        slidesData = slideGroup
        if (document.getElementById('slides-data')) {
            const jsonData = document.getElementById('slides-data').textContent;
            slidesData = JSON.parse(jsonData);
        }
    } catch (error) {
        console.error('Error loading slides:', error);
    }
}

export function addSlide(direction) {
    if (direction === 'right') {
        slidesData.splice(_currentSlide + 1, 0, createDefaultSlide());
        _currentSlide++;
    } else if (direction === 'down') {
        if (!slidesData[_currentSlide].childs) {
            slidesData[_currentSlide].childs = [];
        }
        slidesData[_currentSlide].childs.push(createDefaultSlide());
        _currentChildIndex = slidesData[_currentSlide].childs.length - 1;
    }
}
