import './styles/styles.css';
import { initApp } from './js/app.js';
import { toggleEditorMode } from './js/editor.js';
import { setupThemeToggle } from './js/theme.js';
import {initWebSocket} from "./js/wsclient";
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupThemeToggle();
    initWebSocket();
    document.addEventListener('keydown', (event) => {
        if (event.key === 'e') {
            toggleEditorMode();
        }
    });
});
