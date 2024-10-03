const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const apiKey = process.env.spooncular_apiKey || "your-default-api-key"; // Make sure to use your environment variable

/**
 * Mock function for fetching recipe previews based on the amount needed.
 * @param {number} amount - The number of recipe previews to fetch.
 */

/**
 * Get full recipe details by ID using the Spoonacular API.
 * @param {number} recipeId - The ID of the recipe.
 */
async function getRecipeDetails(recipeId) {
  try {
    const response = await axios.get(`${api_domain}/${recipeId}/information`, {
      params: {
        apiKey: apiKey,
      },
    });
    const {
      id,
      title,
      readyInMinutes,
      image,
      aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
    } = response.data;
    return {
      id,
      title,
      readyInMinutes,
      image,
      popularity: aggregateLikes,
      vegan,
      vegetarian,
      glutenFree,
    };
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return { status: 500, data: {} }; // Return an empty object on error
  }
}

/**
 * Fetch a random set of recipes using the Spoonacular API.
 * @param {number} amount - Number of random recipes to fetch.
 */
async function getRecipesPreviewRandom(amount = 1) {
  try {
    const response = await axios.get(`${api_domain}/random`, {
      params: {
        number: amount,
        apiKey: apiKey,
      },
    });
    const recipes = response.data.recipes;
    return { data: { recipes } };
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    return { data: { recipes: [] } }; // Return an empty list on error
  }
}

/**
 * Search for recipes based on the provided parameters.
 * @param {Object} params - The search parameters (query, cuisine, diet, etc.).
 */
async function searchRecipes({
  query,
  resultsCount,
  sortBy,
  filterBy,
  cuisineType,
  mealType,
}) {
  const searchQuery = query.trim().toLowerCase();
  if (!searchQuery) {
    return [];
  }

  try {
    // Set up the API request parameters
    let apiParams = {
      query: searchQuery,
      number: resultsCount,
      apiKey: apiKey,
    };

    // Add optional filters
    if (filterBy) {
      if (filterBy === "vegetarian") {
        apiParams.diet = "vegetarian";
      } else if (filterBy === "vegan") {
        apiParams.diet = "vegan";
      } else if (filterBy === "gluten free") {
        apiParams.intolerances = "gluten";
      }
    }

    if (cuisineType) {
      apiParams.cuisine = cuisineType;
    }

    if (mealType) {
      apiParams.type = mealType;
    }

    // Sort by popularity or time
    if (sortBy === "likes") {
      apiParams.sort = "popularity";
    } else if (sortBy === "time") {
      apiParams.sort = "time";
    }

    // Call Spoonacular API
    const response = await axios.get(`${api_domain}/complexSearch`, {
      params: apiParams,
    });

    const recipes = response.data.results;
    if (recipes && recipes.length > 0) {
      return recipes.slice(0, resultsCount); // Return a limited number of results
    } else {
      console.error("No recipes found");
      return [];
    }
  } catch (error) {
    console.error("Error during recipe search:", error);
    return [];
  }
}

module.exports = {
  getRecipeDetails,
  getRecipesPreviewRandom,
  searchRecipes,
};
