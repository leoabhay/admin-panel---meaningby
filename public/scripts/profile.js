const form = document.querySelector('.update-form form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    // Get the userId from the hidden input field
    const userId = form.querySelector('input[name="userId"]').value;

    try {
        const response = await fetch(`/api/user/update/${userId}`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            alert('Profile updated successfully!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert('Error updating profile: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Request failed:', error);
        alert('An error occurred while updating the profile.');
    }
});