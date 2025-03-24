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

    document.querySelectorAll('.ql-container').forEach(editor => {
        if (editor.__quill) {
            if (editor.__quill.destroy) {
                editor.__quill.destroy();
            }
            editor.__quill = null;
        }
    });

    const slideContainer = document.getElementById("slide-container");
    while (slideContainer.firstChild) {
        slideContainer.removeChild(slideContainer.firstChild);
    }

    // document.querySelectorAll('[data-slide-index]').forEach(updateEditableState);

    renderSlide(getCurrentSlide(), getCurrentChildIndex());
}

export function makeEditable(element, property, slideIndex, childIndex) {
    element.dataset.slideIndex = slideIndex;
    element.dataset.childIndex = childIndex;
    element.dataset.property = property;

    updateEditableState(element);
    if (isEditorMode) {
        if (element.classList.contains('ql-container')) {
            return;
        }
        if (element.__quill) {
            element.__quill.destroy();
            element.__quill = null;
        }
        const editorContainer = document.createElement('div');
        editorContainer.innerHTML = element.innerHTML;
        editorContainer.classList.add(...element.classList);
        element.replaceWith(editorContainer);

        const quill = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'], // Text-Formatierung
                    ['link'], // Link-Button
                    [{ list: 'ordered' }, { list: 'bullet' }], // Geordnete & ungeordnete Listen
                    [{ align: [] }], // Textausrichtung (links, mitte, rechts)
                    ['image'],
                    ['clean'] // Formatierung entfernen
                ],
                clipboard: {
                    matchVisual: false // Verhindert Format-Probleme beim Einfügen
                }
            }
        });

        quill.root.addEventListener('paste', async (event) => {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;

            for (const item of items) {
                if (item.type.indexOf('image') === 0) {
                    const file = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const base64String = event.target.result;
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, 'image', base64String);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
        editorContainer.__quill = quill;

        quill.on('text-change', function () {
            let newValue = quill.root.innerHTML
                .replace(/<p>\s*<\/p>/g, '<br>')  // Leere Absätze <p></p> in einen <br> umwandeln
                .replace(/<p>/g, '')  // Öffnende <p> entfernen
                .replace(/<\/p>/g, '<br>')  // Schließende </p> durch <br> ersetzen
                .replace(/(<br>\s*){2,}/g, '<br><br>'); // Mehr als 2 <br> auf genau 2 reduzieren
           if (childIndex >= 0) {
                slidesData[slideIndex].childs[childIndex][property] = newValue;
            } else {
                slidesData[slideIndex][property] = newValue;
            }
            console.log('Updated slide data:', newValue);
        });

        editorContainer.addEventListener('blur', function () {
            if (!isEditorMode) return;
            console.log('Final content:', quill.root.innerHTML);
        });
    }

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
