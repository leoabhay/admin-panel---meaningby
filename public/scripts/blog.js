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

    fetchBlogs();
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
    document.getElementById('formTitle').innerText = 'Create Blog';
    document.getElementById('blogIdInput').value = '';
    document.getElementById('titleInput').value = '';
    document.getElementById('descriptionInput').value = '';
    tinymce.get('fullDescriptionInput').setContent('');
    document.getElementById('authorInput').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '';
}

async function fetchBlogs() {
    try {
        const response = await fetch('/api/blog/getAll');
        const data = await response.json();
        if (data.blogs) {
            const blogList = document.querySelector('.list tbody');
            blogList.innerHTML = '';

            data.blogs.forEach(blog => {
                const blogRow = document.createElement('tr');
                blogRow.innerHTML = `
                    <td>${blog.title}</td>
                    <td>${blog.description}</td>
                    <td>${blog.full_description}</td>
                    <td>${blog.author}</td>
                    <td><img src="${blog.image}" alt="Blog Image" style="width: 100px; height: auto; object-fit: cover;"></td>
                    <td>${new Date(blog.createdAt).toLocaleString()}</td>
                    <td>
                        <button onclick="editBlog('${blog._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteBlog('${blog._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                blogList.appendChild(blogRow);
            });
        }
    } catch (err) {
        console.error("Error fetching blogs:", err);
    }
}

async function saveBlog() {
    const blogId = document.getElementById('blogIdInput').value;
    const title = document.getElementById('titleInput').value;
    const description = document.getElementById('descriptionInput').value;
    const fullDescription = tinymce.get('fullDescriptionInput').getContent();
    const author = document.getElementById('authorInput').value;
    const imageFile = document.getElementById('imageInput').files[0];

    if (!title || !description || !fullDescription || !author) {
        alert('All fields are required!');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('full_description', fullDescription);
    formData.append('author', author);
    if (imageFile) formData.append('image', imageFile);

    const url = blogId ? `/api/blog/update/${blogId}` : '/api/blog/create';
    const method = blogId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchBlogs();
            togglePopupForm(false);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving blog:', error);
        alert('Failed to save blog.');
    }
}

async function deleteBlog(blogId) {
    try {
        const response = await fetch(`/api/blog/delete/${blogId}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchBlogs();
        }
    } catch (error) {
        console.error('Error deleting blog:', error);
    }
}

async function editBlog(blogId) {
    try {
        const response = await fetch(`/api/blog/get/${blogId}`, { method: 'GET' });
        const data = await response.json();

        if (data) {
            document.getElementById('blogIdInput').value = data._id;
            document.getElementById('titleInput').value = data.title || '';
            document.getElementById('descriptionInput').value = data.description || '';
            tinymce.get('fullDescriptionInput').setContent(data.full_description || '');
            document.getElementById('authorInput').value = data.author || '';
            if (data.image) {
                document.getElementById('imagePreview').src = data.image;
                document.getElementById('imagePreview').style.display = 'block';
            } else {
                document.getElementById('imagePreview').style.display = 'none';
            }

            document.getElementById('formTitle').innerText = 'Edit Blog';
            togglePopupForm(true);
        }
    } catch (error) {
        console.error('Error editing blog:', error);
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