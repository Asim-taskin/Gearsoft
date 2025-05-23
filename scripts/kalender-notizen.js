document.addEventListener("DOMContentLoaded", () => {
    const notesTextarea = document.getElementById("notes-textarea");
    const notesModal = document.getElementById("notes-modal");
    const notesList = document.getElementById("notes-list");
    const noteEditModal = document.getElementById("note-edit-modal");
    const noteEditForm = document.getElementById("note-edit-form");
    const noteContent = document.getElementById("note-content");

let notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];


    function renderNotes() {
        notesList.innerHTML = "";
        if (notes.length === 0) {
            notesList.innerHTML = '<li class="note-item no-notes">Keine Notizen gespeichert.</li>';
        } else {
            notes.forEach((note, index) => {
                notesList.innerHTML += `
                    <li class="note-item" data-index="${index}">
                        <div class="note-content">${note.content}</div>
                        <div class="note-meta">${new Date(note.timestamp).toLocaleString()}</div>
                    </li>
                `;
            });
        }
    }

    document.getElementById("save-notes-btn").addEventListener("click", () => {
        const val = notesTextarea.value.trim();
        if (val) {
            notes.push({ content: val, timestamp: Date.now() });
            localStorage.setItem("dashboardNotes", JSON.stringify(notes));
            notesTextarea.value = "";
            renderNotes();
            notesModal.classList.add("show");
            setTimeout(() => notesModal.classList.remove("show"), 2000);
        }
    });

    notesList.addEventListener("click", (e) => {
        const item = e.target.closest(".note-item");
        const index = item ? parseInt(item.getAttribute("data-index")) : -1;
        if (item && index >= 0) {
            noteContent.value = notes[index].content;
            noteEditModal.style.display = "flex";

            noteEditForm.onsubmit = (e) => {
                e.preventDefault();
                const newContent = noteContent.value.trim();
                if (newContent) {
                    notes[index].content = newContent;
                    notes[index].timestamp = Date.now();
                    localStorage.setItem("dashboardNotes", JSON.stringify(notes));
                    renderNotes();
                    noteEditModal.style.display = "none";
                }
            };

            noteEditModal.querySelector(".modal-btn-delete").onclick = () => {
                notes.splice(index, 1);
                localStorage.setItem("dashboardNotes", JSON.stringify(notes));
                renderNotes();
                noteEditModal.style.display = "none";
            };

            noteEditModal.querySelector(".modal-btn-secondary").onclick = () => {
                noteEditModal.style.display = "none";
            };

            noteEditModal.querySelector(".modal-close").onclick = () => {
                noteEditModal.style.display = "none";
            };

            noteEditModal.addEventListener("click", e => {
                if (e.target === noteEditModal) noteEditModal.style.display = "none";
            }, { once: true });
        }
    });

    renderNotes();
});
