const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const apiKey = process.env.spooncular_apiKey || "11e9dcf4613543f58eb3dfd4c35b0a78"; // Make sure to use your environment variable

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
    console.log(recipeId);
    // Call Spoonacular API to get full details of the recipe by ID
    if (recipeId == undefined) {
      return { status: 500, data: {} };
    }
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${recipeId}/information`,
      {
        params: {
          apiKey: apiKey,
        },
      }
    );

    // Return the data in a similar structure to your previous mock
    return { status: 200, data: { recipe: response.data } };
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return { status: 500, data: {} }; // Return an empty object on error
  }
}

/**
 * Fetch a random set of recipes using the Spoonacular API.
 * @param {number} amount - Number of random recipes to fetch.
 */
async function getRecipesPreviewRandom(amount = 3) {
  try {
    const response = await axios.get(`${api_domain}/random`, {
      params: {
        number: amount,
        apiKey: apiKey,
      },
    });
    const recipes = response.data.recipes;
    console.log(response.data);
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
async function getRecipeInstructions(recipeId, userName) {
  try {
    console.log("Recipe instructions for " + recipeId, userName);
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions`,
      {
        params: {
          apiKey: apiKey, // Your Spoonacular API key
        },
      }
    );

    if (response.data) {
      console.log(`Recipe instructions for ${userName}:`, response.data);
      return response.data; // Return the entire JSON response
    } else {
      console.log(`No instructions found for recipeId: ${recipeId}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching recipe instructions for ${recipeId}:`, error);
    throw error;
  }
}

module.exports = {
  getRecipeDetails,
  getRecipesPreviewRandom,
  searchRecipes,
  getRecipeInstructions,
};
