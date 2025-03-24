import { renderSlide } from './renderer.js';
import { slidesData, getCurrentSlide, getCurrentChildIndex } from './slides.js';
import {isSet} from "./parameter";
export let isEditorMode = false;
const BlockEmbed = Quill.import('blots/block/embed');

class PollBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        const pollData = JSON.parse(value);
        node.setAttribute('data-poll-id', pollData.pollId);
        node.setAttribute('data-poll', value);

        const questionEl = document.createElement('div');
        questionEl.className = 'poll-question';
        questionEl.textContent = pollData.question;
        node.appendChild(questionEl);

        pollData.answers.forEach((answer, index) => {
            const answerEl = document.createElement('div');
            answerEl.className = 'poll-answer';
            answerEl.textContent = answer;
            answerEl.setAttribute('data-answer-index', index);

            node.appendChild(answerEl);
        });

        return node;
    }

    static value(node) {
        return node.getAttribute('data-poll');
    }
}

PollBlot.blotName = 'poll';
PollBlot.tagName = 'div';
PollBlot.className = 'poll-container';

Quill.register(PollBlot);

function handlePollClick(question, selectedAnswer) {
    console.log(`Frage: ${question}, Antwort: ${selectedAnswer}`);
}

export function setupEditor()    {
    if (isSet('admin','1','0')) {
        const editorToggle = document.createElement('button');
        editorToggle.id = 'editor-toggle';
        editorToggle.innerHTML = '✏️';
        editorToggle.onclick = toggleEditorMode;
        document.body.appendChild(editorToggle);

        const btnCreateSession = document.createElement('button');
        btnCreateSession.id = 'create-session';
        btnCreateSession.innerHTML = '🚀️';
        btnCreateSession.onclick = createSession;
        document.body.appendChild(btnCreateSession);
    }
}

function createSession() {
    fetch('http://localhost:4000/create-session', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            const url = `${location.origin}${location.pathname}?session=${data.sessionId}`;
            console.log(`Session erstellt: ${url}`);
        });
}

export function toggleEditorMode() {
    isEditorMode = !isEditorMode;
    document.body.classList.toggle('editor-mode');
    document.getElementById('editor-toggle').classList.toggle('active');

    document.querySelectorAll('.ql-container').forEach(editor => {
        if (editor.__quill && editor.__quill.destroy) {
            editor.__quill.destroy();
        }
        editor.__quill = null;
    });

    const slideContainer = document.getElementById("slide-container");
    slideContainer.innerHTML = '';

    renderSlide(getCurrentSlide(), getCurrentChildIndex());
}
function createQuillEditor(editorContainer) {
    const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['link'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    ['image'],
                    ['clean'],
                    ['poll'] // benutzerdefinierter Button
                ],
                handlers: {
                    poll: function() {
                        const pollData = promptPollData();
                        if (!pollData) return;
                        const range = this.quill.getSelection(true);
                        this.quill.insertEmbed(range.index, 'poll', JSON.stringify(pollData));
                    }
                }
            },
            clipboard: { matchVisual: false }
        }
    });
    return quill;
}
function promptPollData() {
    const pollId = prompt("Gib eine eindeutige Poll-ID ein (z.B. poll-1):");
    if (!pollId) return null;

    const question = prompt("Gib die Frage der Umfrage ein:");
    if (!question) return null;

    const answersRaw = prompt("Antworten (getrennt durch Semikolons):");
    if (!answersRaw) return null;

    const answers = answersRaw.split(';').map(ans => ans.trim()).filter(ans => ans);
    if (answers.length === 0) return null;

    return { pollId, question, answers };
}


export function makeEditable(element, property, slideIndex, childIndex) {
    element.dataset.slideIndex = slideIndex;
    element.dataset.childIndex = childIndex;
    element.dataset.property = property;

    updateEditableState(element);

    if (isEditorMode) {
        if (element.classList.contains('ql-container')) return;

        if (element.__quill) {
            element.__quill.destroy();
            element.__quill = null;
        }

        const editorContainer = document.createElement('div');
        editorContainer.innerHTML = element.innerHTML;
        editorContainer.classList.add(...element.classList);
        element.replaceWith(editorContainer);

        const quill = createQuillEditor(editorContainer);

        quill.on('text-change', function () {
            const newValue = quill.root.innerHTML
                .replace(/<p>\s*<\/p>/g, '<br>')
                .replace(/<p>/g, '')
                .replace(/<\/p>/g, '<br>')
                .replace(/(<br>\s*){2,}/g, '<br><br>');

            if (childIndex >= 0) {
                slidesData[slideIndex].childs[childIndex][property] = newValue;
            } else {
                slidesData[slideIndex][property] = newValue;
            }
        });

        editorContainer.__quill = quill;
    }
}

function updateEditableState(element) {
    element.contentEditable = isEditorMode;
    element.classList.toggle('editable', isEditorMode);
}

export function insertPoll(quill, pollData) {
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'poll', JSON.stringify(pollData));
}

export function makeImageEditable(imgElement, slideIndex, childIndex) {
    imgElement.dataset.slideIndex = slideIndex;
    imgElement.dataset.childIndex = childIndex;

    imgElement.addEventListener('click', function () {
        if (!isEditorMode) return;
        openImageDialog(imgElement);
    });
}

function openPollDialog(quill) {
    const question = prompt("Gib deine Umfrage-Frage ein:");
    if (!question) return;

    const answersRaw = prompt("Gib Antworten ein, getrennt durch Semikolon (;) :");
    if (!answersRaw) return;

    const answers = answersRaw.split(';').map(ans => ans.trim()).filter(ans => ans);

    const pollData = { question, answers };
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'poll', JSON.stringify(pollData), 'user');
}

function openImageDialog(imgElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            convertToBase64(file, base64String => {
                imgElement.src = base64String;
                const slideIndex = parseInt(imgElement.dataset.slideIndex);
                const childIndex = parseInt(imgElement.dataset.childIndex);
                if (childIndex >= 0) {
                    slidesData[slideIndex].childs[childIndex].image = base64String;
                } else {
                    slidesData[slideIndex].image = base64String;
                }
            });
        }
    };

    input.click();
}

function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
}
export function getEditorMode() {
    return isEditorMode;
}
