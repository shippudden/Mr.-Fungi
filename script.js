let ingredientInput = document.getElementById('ingredient-input');
let recipeResults = document.getElementById('recipeResults');
let button = document.getElementById('searchBtn');
let errorMsg = document.querySelector('.error-msg');

// Modal elements
let recipeModal = document.getElementById('recipeModal');
let modalContent = document.querySelector('.modal-content');
let closeModal = document.querySelector('.bx-x');

let modalTitle = document.getElementById('modalTitle');
let modalImage = document.getElementById('modalImage');
let modalIngredients = document.getElementById('modalIngredients');
let modalCategory = document.getElementById('modalCategory');
let modalInstructions = document.getElementById('modalInstructions');

let resultsContainer = document.getElementById('recipeResults');

// Function to show skeleton cards while fetching data
// This function creates a number of skeleton cards to indicate loading state
function showSkeletons(count) {
    resultsContainer.innerHTML = ''; // Clear previous results

    for (let i = 0; i < count; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.classList.add('skeleton-card');
        // Create skeleton structure
        skeletonCard.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-category"></div>
                <div class="skeleton-button"></div>
            </div>
        `;
        resultsContainer.appendChild(skeletonCard);
    }
}

// Function to show recipe details in a modal
// This function is called when a user clicks on "View Details" button of a recipe card
function showRecipeDetails (recipe) {
    modalTitle.innerText = recipe.strMeal;
    modalImage.src = recipe.strMealThumb;
    modalImage.alt = recipe.strMeal;
    modalCategory.innerText = recipe.strCategory || 'N/A';
    modalInstructions.innerText = recipe.strInstructions || 'No instructions available.';

    modalIngredients.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient) {
            const li = document.createElement('li');
            // This shows the ingredient with its measure if available infront of the ingredient name
            // If measure is not available, it just shows the ingredient name
            li.textContent = `${measure ? measure + ' ' : ''}${ingredient}`;
            modalIngredients.appendChild(li);
        }
    }
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    recipeModal.classList.add('show'); // Show the modal
}

// Close the modal when the close button is clicked or when clicking outside the modal
closeModal.addEventListener('click', () => {
    recipeModal.classList.remove('show'); // Hide the modal
    document.body.style.overflow = ''; // Restore background scrolling
});

closeModal.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        recipeModal.classList.remove('show'); // Hide the modal
        document.body.style.overflow = ''; // Restore background scrolling
    }
});

recipeModal.addEventListener('click', (event) => {
    if (event.target === recipeModal) {
        recipeModal.classList.remove('show'); // Hide the modal when clicking outside the content
        document.body.style.overflow = ''; // Restore background scrolling
    }  
});

// Add an event listener for the Tab key
// This will allow users to navigate through the modal using Tab key
recipeModal.addEventListener('keydown', (event) => {
    const focusable =  recipeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    if (event.key === 'Tab') {
        if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus(); // Loop to the last focusable element
            }
        } else { // Tab
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus(); // Loop to the first focusable element
            }
        }
    }
})

// Add an event listener for the Escape key
// This will close the modal when Escape is pressed
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && recipeModal.classList.contains('show')) {
        recipeModal.classList.remove('show'); // Hide the modal when Escape is pressed
        document.body.style.overflow = ''; // Restore background scrolling
    }
});

// Add an event listener for the search button
// This will trigger the recipe search when the button is clicked
    button.addEventListener('click', () => {
        if (ingredientInput.value.trim() === '') {
            // Display an error message if the input is empty
            errorMsg.textContent = 'Please enter an ingredient.';
        } else {
            // Clear the error message
            errorMsg.textContent = '';
            // Fetch recipes with the provided ingredients
            fetchRecipes(ingredientInput.value);
        }
    });

    // Add an event listener for the Enter key
    // This allows users to submit the ingredient input by pressing Enter
    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            if (ingredientInput.value.trim() === '') {
                errorMsg.textContent = 'Please enter at least one ingredient.';
            } else {
                errorMsg.textContent = '';
                fetchRecipes(ingredientInput.value);
            }
        }
    });

    // Function to fetch recipes based on the ingredient input
function fetchRecipes () {
    // Use only the first ingredient for TheMealDB filter
    const firstIngredient = ingredientInput.value.split(',')[0].trim();
    recipeResults.innerHTML = ''; // Clear previous results

    showSkeletons(3); // Show 3 skeleton cards while fetching data
    // Fetch recipes from TheMealDB API using the first ingredient
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(firstIngredient)}`).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
    }).then(data => {
        if (data.meals) {
            // fetch full details for each meal
            Promise.all(
                data.meals.map(meal => {
                    return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`).then(response => response.json()).then(details => details.meals[0]); // Get the first meal from the details, the first and only meal object returned by lookup.php?i= endpoint
                })
            ).then(fullDetails => {
                displayRecipes(fullDetails);
            })
        } else {
            recipeResults.innerHTML = '<p class="no-result">No recipes found.</p>';
        }
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        recipeResults.innerHTML = '<p class="no-result">Error fetching recipes. Please try again later.</p>';
    })
}

// Function to display recipes in the results section
// This function is called after fetching the recipes from the API
function displayRecipes (recipes) {
    recipeResults.innerHTML = ''
    if (!recipes || recipes.length === 0) {
        recipeResults.innerHTML = '<p class="no-result">No recipes found.</p>';
        return;
    }
    recipes.forEach((recipe, index) => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.setAttribute('data-id', recipe.idMeal);
        card.style.animationDelay = `${index * 0.1}s`; // Add a delay for each card to create a staggered effect

        card.innerHTML = `
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <div class='recipe-card-content'>
                    <h3>${recipe.strMeal}</h3>
                    <p><strong>Category:</strong> ${recipe.strCategory || 'N/A'}</p>
                    <a tabIndex='0' role='button' class='view-details-btn' data-id='${recipe.idMeal}'>View Details</a>
                </div>
        `;
        recipeResults.appendChild(card);
    });
    // Add event listener to each recipe card
    // This allows users to click on the card to view details
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (event) => {
            const mealId = event.currentTarget.getAttribute('data-id');
            const recipe = recipes.find(r => r.idMeal === mealId);
            showRecipeDetails(recipe);
        });
    });

    // Add event listener to all "View Details" buttons (after cards are rendered)
    document.querySelectorAll('.view-details-btn').forEach(function (button) {
        button.addEventListener('click', (event) => {
            const mealId = event.currentTarget.getAttribute('data-id');
            const recipe = recipes.find(r => r.idMeal === mealId);
            showRecipeDetails(recipe);
        });
        // Add keyboard accessibility for "View Details" buttons
        // This allows users to open the recipe details using Enter or Space keys
        button.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                const mealId = this.getAttribute('data-id');
                const recipe = recipes.find(r => r.idMeal === mealId);
                showRecipeDetails(recipe);
            }
        })
    });
}