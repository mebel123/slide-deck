import { loadSlides } from './slides.js';
import { setupControls } from './controls.js';
import { renderSlide } from './renderer.js';
import { setupEditor } from './editor.js';
import { setupEventListeners } from './events.js';

export function initApp() {
    loadSlides().then(() => {
        renderSlide(0, -1);
        setupControls();
        setupEditor();
        setupEventListeners();
    });
}
