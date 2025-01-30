let currentSlide = 0
let currentChildIndex = -1 // -1 bedeutet, dass wir uns auf der Hauptfolie befinden
let activeSlides = [];
let currentSlideDiv = null
let isEditorMode = false;

function createDefaultSlide() {
    return {
        title: "New Slide",
        titleStyle: '{"text-align":"center"}',
        content: "Add your content here",
        contentStyle: '{"text-align":"left"}',
        image: null,
        childs: []
    };
}

function addSlide(direction) {
    if (direction === 'right') {
        // Füge nach dem aktuellen Slide ein
        slidesData.splice(currentSlide + 1, 0, createDefaultSlide());
        currentSlide++;
    } else if (direction === 'down') {
        // Füge als Child zum aktuellen Slide hinzu
        if (!slidesData[currentSlide].childs) {
            slidesData[currentSlide].childs = [];
        }
        slidesData[currentSlide].childs.push({
            title: "New Child Slide",
            content: "Add your child content here",
            image: null
        });
        currentChildIndex = slidesData[currentSlide].childs.length - 1;
    }
    renderSlide(currentSlide, currentChildIndex, direction);
    updateControls();
}

function renderSlide(index, childIndex = -1, direction = 'none') {
    console.log('Rendering slide with direction:', direction);

    const slideContainer = document.getElementById("slide-container")
    const oldSlide = slideContainer.firstChild

    const slide = slidesData[index]
    const slideData = childIndex >= 0 ? slide.childs[childIndex] : slide

    const slideDiv = document.createElement("div")
    slideDiv.classList.add("slide")

    // Neuer Container für den Slide-Content
    const slideContent = document.createElement("div")
    slideContent.classList.add("slide-content")

    const title = document.createElement("div")
    title.innerHTML = slideData.title
    title.classList.add("slide-title")
    if (slideData.titleStyle) {
        try {
            Object.assign(title.style, JSON.parse(slideData.titleStyle));
        } catch (e) {
            console.error("Invalid titleStyle JSON:", slideData.titleStyle, e);
        }
    }
    makeEditable(title, 'title', index, childIndex);

    const content = document.createElement("div")
    content.innerHTML = slideData.content
    content.classList.add("slide-content")
    if (slideData.contentStyle) {
        try {
            Object.assign(content.style, JSON.parse(slideData.contentStyle));
        } catch (e) {
            console.error("Invalid contentStyle JSON:", slideData.contentStyle, e);
        }
    }
    makeEditable(content, 'content', index, childIndex);

    if (slideData.image) {
        const imageWrapper = document.createElement("div")
        imageWrapper.classList.add("image-wrapper")
        const image = document.createElement("img")
        image.src = slideData.image
        image.classList.add("slide-image")
        makeImageEditable(image, index, childIndex);
        imageWrapper.appendChild(image)
        slideContent.appendChild(imageWrapper)
    }

    slideContent.appendChild(title)
    slideContent.appendChild(content)
    slideDiv.appendChild(slideContent)

    // Füge Richtungsklassen für alle vier Richtungen hinzu
    if (['left', 'right', 'up', 'down'].includes(direction)) {
        slideDiv.addEventListener('animationend', function handleAnimationEnd(event) {
            console.log('Animation ended:', event.animationName);
            console.log('Removing slide');
            oldSlide.remove();
            activeSlides = activeSlides.filter(slide => slide !== oldSlide);
        });
        // Füge Klasse zur neuen Slide hinzu
        slideDiv.classList.add(`slide-in-${direction}`)

        // Prüfe ob oldSlide existiert und ein Element ist
        if (oldSlide !== null) {
            const outDirection = direction === 'left' ? 'right' :
                direction === 'right' ? 'left' :
                    direction === 'up' ? 'up' : 'down';

            oldSlide.classList.add(`slide-out-${outDirection}`);
        }
    }

    slideContainer.appendChild(slideDiv)
    activeSlides.push(slideDiv)
}

function setStyle(slideIndex, childIndex, property, styleKey, styleValue) {
    const slideData = childIndex >= 0 ? slidesData[slideIndex].childs[childIndex] : slidesData[slideIndex];

    // Entscheide, ob es `titleStyle` oder `contentStyle` betrifft
    const styleProperty = property === "title" ? "titleStyle" : "contentStyle";

    // Lade existierenden Stil oder erstelle neues leeres Objekt
    let styleObj = {};
    try {
        styleObj = slideData[styleProperty] ? JSON.parse(slideData[styleProperty]) : {};
    } catch (e) {
        console.error(`Invalid JSON in ${styleProperty}:`, slideData[styleProperty], e);
    }

    // Setze den neuen Wert für das spezifische Style-Attribut
    styleObj[styleKey] = styleValue;

    // Speichere das aktualisierte JSON-String-Format zurück
    slideData[styleProperty] = JSON.stringify(styleObj);

    // Slide neu rendern, um die Änderungen sichtbar zu machen
    renderSlide(slideIndex, childIndex);
}

// Neue Funktion zum Editierbar machen von Elementen
function makeEditable(element, property, slideIndex, childIndex) {
    // Speichere die Position in slidesData
    element.dataset.slideIndex = slideIndex;
    element.dataset.childIndex = childIndex;
    element.dataset.property = property;

    // Aktualisiere editierbar-Status basierend auf Editor-Modus
    updateEditableState(element);

    // Falls es ein Bild ist, keine Ausrichtungs-Toolbar hinzufügen
    if (element.tagName.toLowerCase() === 'img') {
        return;
    }

    const alignmentToolbar = document.createElement("div");
    alignmentToolbar.classList.add("toolbar");
    alignmentToolbar.classList.add("alignment-toolbar");

    const alignLeft = document.createElement("span");
    alignLeft.innerHTML ="format_align_left"
    alignLeft.classList.add("material-icons");
    alignLeft.onclick = () => setStyle(slideIndex, childIndex, property, "text-align", "left");

    const alignCenter = document.createElement("span");
    alignCenter.innerHTML ="format_align_center"
    alignCenter.classList.add("material-icons");
    alignCenter.onclick = () => setStyle(slideIndex, childIndex, property, "text-align", "center");

    const alignRight = document.createElement("span");
    alignRight.innerHTML ="format_align_right"
    alignRight.classList.add("material-icons");
    alignRight.onclick = () => setStyle(slideIndex, childIndex, property, "text-align", "right");

    alignmentToolbar.appendChild(alignLeft);
    alignmentToolbar.appendChild(alignCenter);
    alignmentToolbar.appendChild(alignRight);

    // Toolbar rechts oben positionieren
    alignmentToolbar.style.position = "absolute";
    alignmentToolbar.style.top = "5px";
    alignmentToolbar.style.right = "5px";
    alignmentToolbar.style.display = "flex";
    alignmentToolbar.style.gap = "5px";
    alignmentToolbar.style.background = "rgba(0, 0, 0, 0.7)";
    alignmentToolbar.style.padding = "5px";
    alignmentToolbar.style.borderRadius = "5px";

    // Füge Toolbar dem Element hinzu
    element.appendChild(alignmentToolbar);


    // Event-Listener für Fokus-Verlust
    element.addEventListener('blur', function () {
        if (!isEditorMode) return;

        const newValue = element.innerHTML;
        const slideIdx = parseInt(element.dataset.slideIndex);
        const childIdx = parseInt(element.dataset.childIndex);
        const prop = element.dataset.property;

        // Speichere den neuen Wert im slidesData-Objekt
        if (childIdx >= 0) {
            slidesData[slideIdx].childs[childIdx][prop] = newValue;
        } else {
            slidesData[slideIdx][prop] = newValue;
        }

        console.log('Updated slide data:', slidesData[slideIdx]);
    });
}

// Funktion zum Aktualisieren des editierbar-Status
function updateEditableState(element) {
    if (isEditorMode) {
        element.contentEditable = true;
        element.classList.add('editable');
    } else {
        element.contentEditable = false;
        element.classList.remove('editable');
    }
}

function cleanupSlides() {
    const slideContainer = document.getElementById("slide-container");
    while (slideContainer.firstChild) {
        slideContainer.removeChild(slideContainer.firstChild);
    }
    activeSlides = [];
}

function updateControls() {
    document.getElementById("prev-btn").disabled = currentSlide === 0
    document.getElementById("next-btn").disabled = currentSlide === slidesData.length - 1
}
// Childs a navigation by key presses up and down. Therefore the slides needs to be animation in up and down direction.

document.addEventListener("keydown", (event) => {
    if (isEditorMode) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        currentChildIndex = -1

        if (event.key === "ArrowLeft") {
            if (currentSlide > 0) {
                currentSlide--
                renderSlide(currentSlide, currentChildIndex, 'left')
            }
        } else {
            if (currentSlide < slidesData.length - 1) {
                currentSlide++
                renderSlide(currentSlide, currentChildIndex, 'right')
            }
        }

        updateControls()
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const currentSlideData = slidesData[currentSlide]
        if (currentSlideData.childs.length === 0) return

        if (event.key === "ArrowUp") {
            currentChildIndex = Math.max(-1, currentChildIndex - 1)
            renderSlide(currentSlide, currentChildIndex, 'down')
        } else {
            currentChildIndex = Math.min(currentSlideData.childs.length - 1, currentChildIndex + 1)
            renderSlide(currentSlide, currentChildIndex, 'up')
        }
    }
})
document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentSlide > 0) {
        currentSlide--
        renderSlide(currentSlide, -1, 'left')
    }
    updateControls()
})

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentSlide < slidesData.length - 1) {
        currentSlide++
        renderSlide(currentSlide, -1, 'right')
    }
    updateControls()
})

async function loadSlides() {
    try {
        // Lese die Daten aus einem versteckten Script-Tag
        const jsonData = document.getElementById('slides-data').textContent;
        slidesData = JSON.parse(jsonData);

        renderSlide(currentSlide);
        updateControls();
    } catch (error) {
        console.error('Error loading slides:', error);
        document.getElementById("slide-container").innerHTML =
            '<div class="error">Failed to load presentation data.</div>';
    }
}

// Entferne die direkten Initialisierungsaufrufe am Ende der Datei
// renderSlide(currentSlide)
// updateControls()

// Stattdessen starte mit dem Laden der Daten
document.addEventListener('DOMContentLoaded', () => {
    renderSlide(currentSlide);
    updateControls();

    // Editor Toggle Button
    const editorToggle = document.createElement('button');
    editorToggle.id = 'editor-toggle';
    editorToggle.innerHTML = '✏️';
    editorToggle.onclick = toggleEditorMode;
    document.body.appendChild(editorToggle);

    // Download Button
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-button';
    downloadButton.innerHTML = '⬇️';
    downloadButton.onclick = downloadSlidesData;
    downloadButton.style.display = 'none';
    document.body.appendChild(downloadButton);

    const toggleButton = document.createElement("button");
    toggleButton.innerText = "🌙";
    toggleButton.id = "mode-toggle";
    toggleButton.style.position = "fixed";
    toggleButton.style.top = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.padding = "10px";
    toggleButton.style.border = "none";
    toggleButton.style.borderRadius = "5px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.background = "#fff";
    toggleButton.style.color = "#333";
    toggleButton.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";

    document.body.appendChild(toggleButton);

    function updateMode() {
        if (localStorage.getItem("dark-mode") === "enabled") {
            document.body.classList.add("dark-mode");
            toggleButton.innerText = "☀️";
            toggleButton.style.background = "#333";
            toggleButton.style.color = "#fff";
        } else {
            document.body.classList.remove("dark-mode");
            toggleButton.innerText = "🌙";
            toggleButton.style.background = "#fff";
            toggleButton.style.color = "#333";
        }
    }

    toggleButton.addEventListener("click", function () {
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("dark-mode", "disabled");
        } else {
            localStorage.setItem("dark-mode", "enabled");
        }
        updateMode();
    });

    updateMode();

    // Plus Button Event Listener
    document.getElementById('add-right').addEventListener('click', () => addSlide('right'));
    document.getElementById('add-down').addEventListener('click', () => addSlide('down'));
});

function toggleEditorMode() {
    isEditorMode = !isEditorMode;
    document.body.classList.toggle('editor-mode');
    document.getElementById('editor-toggle').classList.toggle('active');

    // Toggle Download-Button
    const downloadButton = document.getElementById('download-button');
    downloadButton.style.display = isEditorMode ? 'block' : 'none';

    // Aktualisiere alle editierbaren Elemente
    document.querySelectorAll('[data-slide-index]').forEach(updateEditableState);

    // Bestehende Logik...
    cleanupSlides();
    renderSlide(currentSlide, currentChildIndex);
}

// Neue Funktion für editierbare Bilder
function makeImageEditable(imgElement, slideIndex, childIndex) {
    imgElement.dataset.slideIndex = slideIndex;
    imgElement.dataset.childIndex = childIndex;

    // Füge Click-Handler nur im Editor-Modus hinzu
    const updateClickHandler = () => {
        if (isEditorMode) {
            imgElement.classList.add('editable-image');
            imgElement.onclick = () => openImageDialog(imgElement);
        } else {
            imgElement.classList.remove('editable-image');
            imgElement.onclick = null;
        }
    };

    // Initial setzen
    updateClickHandler();

    // Beobachte Änderungen des Editor-Modus
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('editor-mode')) {
                updateClickHandler();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// Funktion zum Öffnen des File-Dialogs
function openImageDialog(imgElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            convertToBase64(file, (base64String) => {
                // Aktualisiere das Bild und speichere es in slidesData
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

// Funktion zur Konvertierung in Base64
function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.error('Error converting image:', error);
    reader.readAsDataURL(file);
}

// Neue Download Funktion
function downloadSlidesData() {
    // Formatiere das slidesData Array als JavaScript-Code
    const content = `const slidesData = ${JSON.stringify(slidesData, null, 2)};`;

    // Erstelle einen Blob mit dem JavaScript-Code
    const blob = new Blob([content], { type: 'application/javascript' });

    // Erstelle einen Download-Link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slides-data.js';

    // Füge den Link zum DOM hinzu, klicke ihn und entferne ihn wieder
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Bereinige die URL
    URL.revokeObjectURL(url);
}
