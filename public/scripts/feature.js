window.onload = function () {
    tinymce.init({
        selector: '#fullDescriptionInput',
        plugins: [
            "anchor",
            "autolink",
            "charmap",
            "codesample",
            "emoticons",
            "image",
            "link",
            "lists",
            "media",
            "searchreplace",
            "table",
            "visualblocks",
            "wordcount",
        ],
        toolbar:
            "undo redo code | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
    });

    fetchFeatures();
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
    document.getElementById('formTitle').innerText = 'Create Feature';
    document.getElementById('featureIdInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('descriptionInput').value = '';
    tinymce.get('fullDescriptionInput').setContent('');
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '';
}

async function fetchFeatures() {
    try {
        const response = await fetch('/api/feature/getAll');
        const data = await response.json();
        if (data.features) {
            const featureList = document.querySelector('.list tbody');
            featureList.innerHTML = '';

            data.features.forEach(feature => {
                const featureRow = document.createElement('tr');
                featureRow.innerHTML = `
                    <td>${feature.title}</td>
                    <td>${feature.description}</td>
                    <td>${feature.full_description}</td>
                    <td><img src="${feature.image}" alt="Feature Image" style="width: 100px; height: auto; object-fit: cover;"></td>
                    <td>
                        <button onclick="editFeature('${feature._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteFeature('${feature._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                featureList.appendChild(featureRow);
            });
        }
    } catch (err) {
        console.error("Error fetching features:", err);
    }
}

async function saveFeature() {
    const featureId = document.getElementById('featureIdInput').value;
    const title = document.getElementById('titleInput').value;
    const description = document.getElementById('descriptionInput').value;
    const fullDescription = tinymce.get('fullDescriptionInput').getContent();
    const imageFile = document.getElementById('imageInput').files[0];

    if (!title || !description || !fullDescription) {
        alert('All fields are required!');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('full_description', fullDescription);
    if (imageFile) formData.append('image', imageFile);

    const url = featureId ? `/api/feature/update/${featureId}` : '/api/feature/create';
    const method = featureId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchFeatures();
            togglePopupForm(false);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving feature:', error);
        alert('Failed to save feature.');
    }
}

async function deleteFeature(featureId) {
    try {
        const response = await fetch(`/api/feature/delete/${featureId}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchFeatures();
        }
    } catch (error) {
        console.error('Error deleting feature:', error);
    }
}

async function editFeature(featureId) {
    try {
        const response = await fetch(`/api/feature/get/${featureId}`, { method: 'GET' });
        const data = await response.json();

        if (data) {
            document.getElementById('featureIdInput').value = data._id;
            document.getElementById('titleInput').value = data.title || '';
            document.getElementById('descriptionInput').value = data.description || '';
            tinymce.get('fullDescriptionInput').setContent(data.full_description || '');
            if (data.image) {
                document.getElementById('imagePreview').src = data.image;
                document.getElementById('imagePreview').style.display = 'block';
            } else {
                document.getElementById('imagePreview').style.display = 'none';
            }

            document.getElementById('formTitle').innerText = 'Edit Feature';
            togglePopupForm(true);
        }
    } catch (error) {
        console.error('Error editing feature:', error);
    }
}

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('imagePreview');
        output.src = reader.result;
        output.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}