import './styles/styles.css';
import { initApp } from './js/app.js';
import {isEditorMode, toggleEditorMode} from './js/editor.js';
import { setupThemeToggle } from './js/theme.js';
import {initWebSocket} from "./js/wsclient";
import {downloadSlidesData} from "./js/slides";
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupThemeToggle();
    initWebSocket();
    document.addEventListener('keydown', (event) => {
        if (isEditorMode) return;
        if (event.key === 'e') {
            toggleEditorMode();
        }
        if (event.key === 'd') {
            downloadSlidesData();
        }

    });
});
