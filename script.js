document.addEventListener('DOMContentLoaded', () => {
    // Form toggle
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const forms = document.querySelectorAll('.auth-form');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetForm = document.getElementById(`${btn.dataset.form}Form`);
            forms.forEach(form => {
                form.classList.remove('active');
                form.style.transform = 'translateX(100%)';
            });
            targetForm.classList.add('active');
            targetForm.style.transform = 'translateX(0)';
        });
    });

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Input focus animation
    document.querySelectorAll('.input-group input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Ensure inputs are enabled
    document.querySelectorAll('input').forEach(input => {
        input.removeAttribute('disabled');
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value; // Ensure input updates
        });
    });
});