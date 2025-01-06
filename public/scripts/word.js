window.onload = function () {
    tinymce.init({
        selector: '#definitionInput',
        plugins: [
            "anchor", "autolink", "charmap", "codesample", "emoticons", "image", "link", "lists", "media", 
            "searchreplace", "table", "visualblocks", "wordcount"
        ],
        toolbar: "undo redo code | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat"
    });

    fetchWords();
};

function togglePopupForm(show = true) {
    const popupForm = document.getElementById('popupForm');
    const overlay = document.getElementById('popupOverlay');
    if (show) {
        popupForm.classList.add('active');
        overlay.classList.add('active');
    } else {
        popupForm.classList.remove('active');
        overlay.classList.remove('active');
        resetForm();
    }
}

function resetForm() {
    document.getElementById('formTitle').innerText = 'Create Word';
    document.getElementById('wordIdInput').value = '';
    document.getElementById('wordInput').value = '';
    tinymce.get('definitionInput').setContent('');
    document.getElementById('synonymsInput').value = '';
    document.getElementById('antonymsInput').value = '';
    document.getElementById('exampleInput').value = '';
}

async function fetchWords() {
    try {
        const response = await fetch('/api/word/getAll');
        const data = await response.json();
        if (data.words) {
            const wordList = document.querySelector('.list tbody');
            wordList.innerHTML = ''; // Clear current list

            data.words.forEach(word => {
                const wordRow = document.createElement('tr');
                wordRow.innerHTML = `
                    <td>${word.word}</td>
                    <td>${word.definition}</td>
                    <td>${word.synonyms}</td>
                    <td>${word.antonyms}</td>
                    <td>${word.example}</td>
                    <td>
                        <button onclick="editWord('${word._id}')">
                            <i class="fas fa-edit"></i>   
                        </button>
                        <button onclick="deleteWord('${word._id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                wordList.appendChild(wordRow);
            });
        } else {
            console.error("No words found");
        }
    } catch (err) {
        console.error("Error fetching words:", err);
    }
}

async function saveWord() {
    const wordId = document.getElementById('wordIdInput').value;
    const word = document.getElementById('wordInput').value;
    const definition = tinymce.get('definitionInput').getContent();
    const synonyms = document.getElementById('synonymsInput').value;
    const antonyms = document.getElementById('antonymsInput').value;
    const example = document.getElementById('exampleInput').value;

    if (!word || !definition || !example) {
        alert('Word, definition, and example fields are required!');
        return;
    }

    const url = wordId ? `/api/word/update/${wordId}` : '/api/word/create';
    const method = wordId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word, definition, synonyms, antonyms, example })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchWords();  // Refresh the word list
            togglePopupForm(false); // Hide the form after saving
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving word:', error);
        alert('Failed to save word.');
    }
}

async function deleteWord(wordId) {
    try {
        const response = await fetch(`/api/word/delete/${wordId}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchWords();  // Refresh the list after deletion
        } else {
            console.error('Error response:', data);
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting word:', error);
        alert('Failed to delete word.');
    }
}

async function editWord(wordId) {
    if (!wordId) {
        alert("Invalid word ID");
        return;
    }

    try {
        const response = await fetch(`/api/word/get/${wordId}`);
        
        const data = await response.json();
        console.log("Fetched word data:", data);

        if (response.ok && data) {
            const word = data;

            document.getElementById('wordIdInput').value = word._id;
            document.getElementById('wordInput').value = word.word || ''; // Ensure fallback

            // Use empty string as fallback for undefined or null values
            tinymce.get('definitionInput').setContent(word.definition || '');
            document.getElementById('synonymsInput').value = word.synonyms || '';
            document.getElementById('antonymsInput').value = word.antonyms || '';
            document.getElementById('exampleInput').value = word.example || '';

            document.getElementById('formTitle').innerText = 'Edit Word';
            togglePopupForm(true);
        } else {
            alert('Word not found');
        }
    } catch (error) {
        console.error('Error editing word:', error);
        alert('Failed to edit word.');
    }
}