async function simulateOwnerLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'rgscaffolding@gmail.com' && password === 'rgscaffolding') {
                resolve({
                    token: 'owner_token',
                    user: {
                        id: 1,
                        name: 'Romel Gravidez',
                        email: email,
                        role: 'owner'
                    }
                });
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

// Handle owner login
async function handleOwnerLogin(event) {
    event.preventDefault();

    if (!validateForm()) {
        showNotification('Please fill in all fields correctly', 'error');
        return;
    }

    const loginBtn = event.target.querySelector('.login-button');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await simulateOwnerLogin(email, password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = 'owner-dashboard.html';
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

// Validate form inputs
function validateForm() {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let isValid = true;

    // Email validation
    if (!email.value.trim() || !validateEmail(email.value)) {
        email.classList.add('error');
        isValid = false;
    } else {
        email.classList.remove('error');
    }

    // Password validation
    if (!password.value.trim()) {
        password.classList.add('error');
        isValid = false;
    } else {
        password.classList.remove('error');
    }

    return isValid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ownerLoginForm');
    
    // Add form submission handler
    form.addEventListener('submit', (e) => {
        if (!validateForm()) {
            e.preventDefault();
            showNotification('Please fill in all fields correctly', 'error');
            return;
        }
        handleOwnerLogin(e);
    });

    // Add input validation on blur
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
    });
});