// Import the Supabase client from src/lib/supabaseClient.js
import { supabase } from '../../src/lib/supabaseClient.js';

// Switch between login and signup forms
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginBtn = document.querySelector('[onclick="switchTab(\'login\')"]');
    const signupBtn = document.querySelector('[onclick="switchTab(\'signup\')"]');

    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        loginBtn.classList.remove('active');
        signupBtn.classList.add('active');
    }
}

// Handle login form submission using Supabase auth.signIn
async function handleLogin(event) {
    event.preventDefault();

    if (!validateForm('loginForm')) {
        showNotification('Please fill in all fields correctly', 'error');
        return;
    }

    const loginBtn = event.target.querySelector('.login-button');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        const { data, error } = await supabase.auth.signIn({ email, password });
        if (error) {
            throw error;
        }
        console.log("Login successful:", data);
        // Save the access token if session is available.
        if (data.session) {
            sessionStorage.setItem('token', data.session.access_token);
            localStorage.setItem('token', data.session.access_token);
        }
        window.location.href = 'shop.html';
    } catch (error) {
        handleError(error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

// Handle signup form submission using Supabase auth.signUp
async function handleSignup(event) {
    event.preventDefault();

    if (!validateForm('signupForm')) {
        showNotification('Please fill in all fields correctly', 'error');
        return;
    }

    const signupBtn = event.target.querySelector('.login-button');
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating Account...';

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const address = document.getElementById('signupAddress').value.trim();

    try {
        const { data, error } = await supabase.auth.signUp(
            { email, password },
            { data: { name, phone, address } }
        );
        if (error) {
            throw error;
        }
        console.log("Signup successful:", data);
        // If email confirmation is not required, data.session may be available.
        sessionStorage.setItem('token', data.session?.access_token || '');
        localStorage.setItem('token', data.session?.access_token || '');
        showNotification('Registration successful! Redirecting to shop...', 'success');
        setTimeout(() => {
            window.location.href = 'shop.html';
        }, 1500);
    } catch (error) {
        handleError(error);
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Create Account';
    }
}

// Validate form inputs
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }

        // Email validation
        if (input.type === 'email' && !validateEmail(input.value)) {
            isValid = false;
            input.classList.add('error');
        }

        // Phone validation
        if (input.type === 'tel' && !validatePhone(input.value)) {
            isValid = false;
            input.classList.add('error');
        }
    });

    return isValid;
}

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation function
function validatePhone(phone) {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
}

// Initialize blur event listeners for form inputs
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
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
});

// Expose functions to the global scope so inline HTML event handlers can access them
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;