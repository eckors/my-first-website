// Wait for the HTML to fully load before running scripts
document.addEventListener('DOMContentLoaded', initializePage);

function initializePage() {
    // 1. ALWAYS load and render favorites on EVERY page
    loadFavoritesFromStorage();
    renderFavoritesList();

    // 2. Check which page we are on for page-specific features
    const currentPage = window.location.pathname;

    // Only attach button click events on the products page
    // (We check for the root '/' just in case products is your home page later)
    if (currentPage.includes('products.html')) {
        setupFavoriteButtons();
    } 
    
    // Only run form validation on the contact page
    if (currentPage.includes('contact.html')) {
        setupFormValidation();
    }
}

// ==========================================
// FEATURE 1: FAVORITES TRACKER (Global)
// ==========================================

let userFavorites = [];

// This function ONLY attaches click listeners to the buttons on the Products page
function setupFavoriteButtons() {
    syncFavoriteButtons(); // Set initial button colors
    
    const favButtons = document.querySelectorAll('.fav-btn');
    favButtons.forEach(button => {
        button.addEventListener('click', handleFavoriteClick);
    });
}

// Handles clicking a button on the Products page
function handleFavoriteClick(event) {
    const button = event.target;
    const itemId = button.getAttribute('data-id');

    // Toggle logic
    if (userFavorites.includes(itemId)) {
        userFavorites = userFavorites.filter(item => item !== itemId);
    } else {
        userFavorites.push(itemId);
    }

    saveFavoritesToStorage();
    renderFavoritesList();
    syncFavoriteButtons(); // Ensure buttons match the new list
}

// Handles clicking a tag inside the Favorites box (on ANY page)
function removeFavoriteFromBox(itemId) {
    // Filter the item out of the array
    userFavorites = userFavorites.filter(item => item !== itemId);
    
    saveFavoritesToStorage();
    renderFavoritesList();
    syncFavoriteButtons(); // If we happen to be on the products page, update the buttons!
}

// Syncs the colors/text of the buttons on the Products page to match the array
function syncFavoriteButtons() {
    const favButtons = document.querySelectorAll('.fav-btn');
    
    favButtons.forEach(button => {
        const itemId = button.getAttribute('data-id');
        
        if (userFavorites.includes(itemId)) {
            button.textContent = '♥ Favorited';
            button.style.backgroundColor = 'var(--primary-color)';
        } else {
            button.textContent = '♡ Add to Favorites';
            button.style.backgroundColor = 'var(--secondary-color)';
        }
    });
}

// This function runs on EVERY page to draw the list in the top box
function renderFavoritesList() {
    const listContainer = document.getElementById('favorites-list');
    const emptyMessage = document.getElementById('empty-fav-msg');
    const favCount = document.getElementById('fav-count');
    
    if (!listContainer || !emptyMessage) return;

    if (favCount) {
        favCount.textContent = `(${userFavorites.length})`;
    }

    const existingList = listContainer.querySelector('ul');
    if (existingList) {
        existingList.remove();
    }
    
    if (userFavorites.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        
        const ul = document.createElement('ul');
        ul.className = 'favorites-tag-list';
        
        userFavorites.forEach(item => {
            const li = document.createElement('li');
            // Add the text and the "x" icon
            li.innerHTML = `${item} <span class="remove-icon">×</span>`;
            li.title = "Click to remove from favorites";
            
            // Add the click listener to remove the item!
            li.addEventListener('click', function() {
                removeFavoriteFromBox(item);
            });
            
            ul.appendChild(li);
        });
        
        listContainer.appendChild(ul);
    }
}

// ==========================================
// FEATURE 2: LOCAL STORAGE HELPERS
// ==========================================

function saveFavoritesToStorage() {
    // LocalStorage only saves strings, so we convert the array to a JSON string
    localStorage.setItem('bakeryFavorites', JSON.stringify(userFavorites));
}

function loadFavoritesFromStorage() {
    const storedData = localStorage.getItem('bakeryFavorites');
    if (storedData) {
        // Convert the string back into a JavaScript array
        userFavorites = JSON.parse(storedData);
    }
}

// ==========================================
// FEATURE 3: FORM VALIDATION (Contact Page)
// ==========================================

function setupFormValidation() {
    const form = document.getElementById('order-form');
    
    // Check if user previously saved their name, and pre-fill it
    const savedName = localStorage.getItem('bakeryUserName');
    if (savedName) {
        document.getElementById('name').value = savedName;
    }

    form.addEventListener('submit', function(event) {
        // Prevent the form from refreshing the page immediately
        event.preventDefault();
        
        if (validateForm()) {
            // Form is valid!
            document.getElementById('form-success-msg').style.display = 'block';
            
            // Save the user's name to LocalStorage for next time
            const userName = document.getElementById('name').value.trim();
            localStorage.setItem('bakeryUserName', userName);
            
            // Optional: reset form after a few seconds
            setTimeout(() => {
                form.reset();
                document.getElementById('form-success-msg').style.display = 'none';
            }, 3000);
        }
    });
}

function validateForm() {
    let isValid = true;
    
    // 1. Get the inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const typeInput = document.getElementById('request-type');
    
    // 2. Get the error spans
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const typeError = document.getElementById('type-error');

    // 3. Reset all error messages before checking
    nameError.textContent = '';
    emailError.textContent = '';
    typeError.textContent = '';

    // Validation 1: Required & Minimum Length (Name)
    if (nameInput.value.trim().length < 5) {
        nameError.textContent = 'Please enter a name with at least 5 characters.';
        isValid = false;
    }

    // Validation 2: Email Pattern Match
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
    }

    // Validation 3: Request Type Selection (Dropdown)
    // The default disabled option has a value of "", so we check for that
    if (typeInput.value === "") {
        typeError.textContent = 'Please select a request type from the dropdown.';
        isValid = false;
    }

    return isValid;
}