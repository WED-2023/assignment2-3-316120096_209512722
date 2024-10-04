var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => {
  res.send("im here");
  console.log("im here");
});

/**
 * This path returns random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const amount = 1;
    console.log(amount);
    console.log("now we start random req"); // Default to 1 if no amount is provided
    const randomRecipes = await recipes_utils.getRecipesPreviewRandom(amount);
    res.send(randomRecipes.data.recipes);
  } catch (error) {
    next(error);
  }
});
/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.query; // For recipe name search
    const cuisine = req.query.cuisine; // For cuisine filter
    const diet = req.query.diet; // For diet filter (e.g., vegan, vegetarian)
    const number = req.query.number || 5; // For the number of results
    const sortBy = req.query.sortBy; // For sorting (e.g., popularity, time)
    const mealType = req.query.mealType; // For meal type (e.g., breakfast, lunch)

    // Call the searchRecipes function with mapped parameters
    const results = await recipes_utils.searchRecipes({
      query: recipeName,
      resultsCount: number,
      sortBy: sortBy,
      filterBy: diet,
      cuisineType: cuisine,
      mealType: mealType,
    });

    res.send(results);
  } catch (error) {
    next(error);
  }
});
router.get("/details/:recipeId", async (req, res, next) => {
  try {
    // Extract the recipe ID from the URL
    const recipeId = req.params.recipeId;
    console.log(recipeId);

    // Call the utility function to fetch recipe details
    const recipeDetails = await recipes_utils.getRecipeDetails(recipeId);

    // Send the recipe details in the response
    res.status(recipeDetails.status).send(recipeDetails.data);
  } catch (error) {
    next(error);
  }
});
router.get("/AnalyedInstructions)", async (req, res, next) => {
  try {
    const recipeId = req.params.recipeId;
    const username = req.params.username;
    const analyzedInstructions = await recipes_utils.getRecipeDetails(recipeId);
    res.status(analyzedInstructions.status).send(analyzedInstructions.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
