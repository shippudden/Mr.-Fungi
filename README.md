# Mr. Fungi 🍄

A fun recipe search app powered by [TheMealDB API](https://www.themealdb.com/api.php).  
Search for recipes by ingredient and view full details in a beautiful modal popup.

---

## Features

- **Ingredient Search:** Enter an ingredient and find recipes that use it.
- **Full Recipe Details:** Click "View Details" to see ingredients, instructions, and more in a modal.
- **Responsive UI:** Clean, modern design with scrollable modal for long recipes.
- **Error Handling:** Friendly messages for empty searches, no results, or network errors.

---

## How to Run

1. **Clone the repo:**
   ```sh
   git clone https://github.com/yourusername/mr-fungi.git
   cd mr-fungi
   ```

2. **Open `index.html` in your browser.**  
   No dependencies or build steps required!

---

## Tech Stack
- HTML
- CSS
- JavaScript (Vanilla)
- TheMealDB API

## File Structure

- `index.html` – Main HTML file, includes input, results, and modal structure.
- `style.css` – All styles for layout, modal, and cards.
- `script.js` – Handles search, API calls, rendering, and modal logic.

---

## Screenshots
![](./Images/Screenshot%202025-07-27%20110552.jpg)
![](./Images/Screenshot%202025-07-27%20110643.jpg)

## 📽️ Demo

[🎥 Watch Demo](https://www.linkedin.com/posts/boluwatife-david-640089309_heres-a-demo-of-the-project-activity-7355161173643689984-WcBv?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE5_2FAB0wo1rn6rJQf0zoPi2aEP6E7PX_Y)

Click the link above to watch a recording of the project in action.

## 🌐 Live Demo  
Check out the live version here: [Mr. Fungi on GitHub Pages](https://shippudden.github.io/Mr.-Fungi/)

## Code Walkthrough

### 1. **Getting User Input**
```javascript
let ingredientInput = document.getElementById('ingredient-input');
let button = document.getElementById('searchBtn');
let errorMsg = document.querySelector('.error-msg');
```
- Grabs references to the input box, search button, and error message area.

### 2. **Handling Search Events**
```javascript
button.addEventListener('click', () => { ... });
ingredientInput.addEventListener('keypress', (event) => { ... });
```
- Listens for button clicks or pressing Enter.
- Validates input and shows an error if empty.

### 3. **Fetching Recipes**
```javascript
function fetchRecipes () {
    // Use only the first ingredient for TheMealDB filter
    const firstIngredient = ingredientInput.value.split(',')[0].trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(firstIngredient)}`)
      .then(response => response.json())
      .then(data => {
        if (data.meals) {
          Promise.all(
            data.meals.map(meal =>
              fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                .then(res => res.json())
                .then(detail => detail.meals[0]) // 
            )
          ).then(fullDetails => displayRecipes(fullDetails));
        } else {
          recipeResults.innerHTML = '<p>No recipes found.</p>';
        }
      })
      // If any error occurs (network or API), logs the error and shows a user-friendly message.
      .catch(error => {
        recipeResults.innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
      });
}
```
- TheMealDB’s filter.php?i= endpoint only supports searching by one ingredient at a    time. If a user enters multiple ingredients (e.g., "chicken, rice"), the code splits the input and uses just the first one (chicken) for the API call.
- If recipes are found, uses Promise.all to fetch full details for each recipe (using their idMeal).
- details.meals[0] is used to access the first (and only) meal object returned by TheMealDB’s lookup.php?i= endpoint.
- Each recipe’s details are fetched and returned as an object.
- Once all details are fetched, calls displayRecipes(fullDetails) to show them.
- If no recipes are found, displays a message.
- Uses TheMealDB API to find recipes by ingredient.
- Fetches full details for each recipe using `Promise.all`.

### 4. **Displaying Recipe Cards**
```javascript
function displayRecipes (recipes) {
    recipeResults.innerHTML = '';
    recipes.forEach(recipe => {
        // Build ingredient list
        let ingredientPairs = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            if (ingredient && ingredient.trim()) {
                const measure = recipe[`strMeasure${i}`];
                ingredientPairs.push(`${measure ? measure + ' ' : ''}${ingredient}`.trim());
            }
        }
        recipeResults.innerHTML += `
            <div class="recipe-card">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <div class='recipe-card-content'>
                    <h3>${recipe.strMeal}</h3>
                    <p><strong>Category:</strong> ${recipe.strCategory || 'N/A'}</p>
                    <a class='view-details-btn' data-id='${recipe.idMeal}'>View Details</a>
                </div>
            </div>
        `;
    });
    // Attach modal event listeners
    document.querySelectorAll('.view-details-btn').forEach(function (button) {
        button.addEventListener('click', function() {
            const mealId = this.getAttribute('data-id');
            const recipe = recipes.find(r => r.idMeal === mealId);
            showRecipeDetails(recipe);
        });
    });
}
```
- The 'view-details-btn' is generated when one searches, then when a card is generated the 'view-details-btn' is created and add to each card.
- The addEventListener is added after because those button doesn't exist yet until I set recipeResults.innerHTML After creating them, you use document.querySelectorAll('.view-details-btn') to find all of them and attach click event listeners.
- Renders recipe cards with a "View Details" button.
- Attaches click events to open the modal.

### 5. **Modal Logic**
```javascript
function showRecipeDetails (recipe) {
    // Sets the modal's title to the recipe's name
    // Sets the modal’s image to the recipe’s thumbnail.
    // Sets the image’s alt text for accessibility.
    modalTitle.innerText = recipe.strMeal;
    modalImage.src = recipe.strMealThumb;
    modalImage.alt = recipe.strMeal;

    // Displays the recipe’s category, or 'N/A' if missing.
    // Displays the recipe’s instructions, or a fallback message if missing.
    modalCategory.innerText = recipe.strCategory || 'N/A';
    modalInstructions.innerText = recipe.strInstructions || 'No instructions available.';

    modalIngredients.innerHTML = '';
    // Loops through up to 20 possible ingredient slots (TheMealDB’s max).
    // For each non-empty ingredient, creates a list item (<li>) showing the measure (if available) and the ingredient name. The i is a loop counter used to access 20 possible ingredient. it access properties like strIngredient1 - strIngredient20. 
    // Example: if i = 3 then: recipe['strIngredient3'] gets the third ingredient, same thing for measure.
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            const li = document.createElement('li');
            li.textContent = `${measure ? measure + ' ' : ''}${ingredient}`;
            modalIngredients.appendChild(li);
        }
    }
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    recipeModal.style.display = 'block';
}

closeModal.addEventListener('click', () => {
    recipeModal.style.display = 'none';
    document.body.style.overflow = '';
});
recipeModal.addEventListener('click', (event) => {
    if (event.target === recipeModal) {
        recipeModal.style.display = 'none';
        document.body.style.overflow = '';
    }
});
```
- Populates and shows the modal with full recipe details.
- Prevents background scrolling while modal is open.
- Closes modal on click outside or on close button.
- Clears the modal content before adding a new item to prevent clutter and duplication.

---

## Challenges & Solutions

- Fetching Full Recipe Details

The initial API response only provided basic meal info.
I needed to use Promise.all with .map() to fetch full details for each recipe using a second API call. The promise.all handles asyncronous operation, if any fetch fails. Promise.all will reject, allowing the catch block to handle errors gracefully and prevent the app from crashing.
Displaying Full Details Without Overwhelming the UI

Showing all recipe details directly on the card made the UI cluttered and hard to read. I also initially set a link directly to the API which opens a new tab but I decided to view all details on the same page.
Solution: Use a modal popup to display full details when the user clicks "View Details".
Modal Not Showing

The modal did not appear when clicking the button.
Cause: Event listeners for "View Details" buttons were not attached correctly because the buttons were dynamically generated.
Solution: Add event listeners inside the displayRecipes function after rendering the buttons.

Modal Not Centered
The modal was not perfectly centered vertically and horizontally.
Cause: CSS issues such as unnecessary margins on .modal-content and possible parent element structure problems.
Solution: Use flexbox on the .modal container and remove conflicting margins from .modal-content.

Page Scrolling When Modal Is Open
The background page scrolled when the modal was open, which was undesirable.
Solution: Set body { overflow: hidden; } when the modal is open and restore it when closed.

Modal Content Not Scrollable
When the modal content exceeded the viewport height, it was not scrollable.
Solution: Add max-height: 80vh; and overflow-y: auto; to .modal-content to allow internal scrolling.

---

## Customization

- Change the theme in `style.css`.
- Tweak modal size or card layout as needed.

---

## License

MIT

---

## Credits

- [TheMealDB](https://www.themealdb.com/) for the free recipe API.
- [Boot.dev Hackathon](https://boot.dev/) for the event inspiration.

## 🏆 Hackathon Entry

This project was built during the [Boot.dev Hackathon – July 2025](https://boot.dev/).  
Category: Amateur 
Team Size: 1 (solo)
Duration: 72 hours  
