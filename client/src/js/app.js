import { loadSlides } from './slides.js';
import { setupControls } from './controls.js';
import { renderSlide } from './renderer.js';
import { setupEditor } from './editor.js';
import { setupEventListeners } from './events.js';
import {loadSlidesBySession} from "./api";

export function initApp() {
    loadSlides().then(async () => {
        await loadSlidesBySession();
        renderSlide(0, -1);
        setupControls();
        setupEditor();
        setupEventListeners();
    });
}
