import { renderSlide } from './renderer.js';
import {slidesData, getCurrentSlide, setCurrentSlide, getCurrentChildIndex} from './slides.js';
export let isEditorMode = false;

export function setupEditor() {
    const editorToggle = document.createElement('button');
    editorToggle.id = 'editor-toggle';
    editorToggle.innerHTML = '✏️';
    editorToggle.onclick = toggleEditorMode;
    document.body.appendChild(editorToggle);
}

export function toggleEditorMode() {
    isEditorMode = !isEditorMode;
    document.body.classList.toggle('editor-mode');
    document.getElementById('editor-toggle').classList.toggle('active');

    document.querySelectorAll('[data-slide-index]').forEach(updateEditableState);

    renderSlide(getCurrentSlide(), getCurrentChildIndex());
}

export function makeEditable(element, property, slideIndex, childIndex) {
    element.dataset.slideIndex = slideIndex;
    element.dataset.childIndex = childIndex;
    element.dataset.property = property;

    updateEditableState(element);

    element.addEventListener('blur', function () {
        if (!isEditorMode) return;

        const newValue = element.innerHTML;
        if (childIndex >= 0) {
            slidesData[slideIndex].childs[childIndex][property] = newValue;
        } else {
            slidesData[slideIndex][property] = newValue;
        }

        console.log('Updated slide data:', slidesData[slideIndex]);
    });
}

export function makeImageEditable(imgElement, slideIndex, childIndex) {
    imgElement.dataset.slideIndex = slideIndex;
    imgElement.dataset.childIndex = childIndex;

    imgElement.addEventListener('click', function () {
        if (!isEditorMode) return;
        openImageDialog(imgElement);
    });
}

function openImageDialog(imgElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            convertToBase64(file, (base64String) => {
                imgElement.src = base64String;

                const slideIndex = parseInt(imgElement.dataset.slideIndex);
                const childIndex = parseInt(imgElement.dataset.childIndex);

                if (childIndex >= 0) {
                    slidesData[slideIndex].childs[childIndex].image = base64String;
                } else {
                    slidesData[slideIndex].image = base64String;
                }

                console.log('Updated image in slide data');
            });
        }
    };

    input.click();
}

function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error converting image:', error);
    reader.readAsDataURL(file);
}

function updateEditableState(element) {
    element.contentEditable = isEditorMode;
    element.classList.toggle('editable', isEditorMode);
}
