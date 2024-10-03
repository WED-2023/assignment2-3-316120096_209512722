var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.recipeName;
    const cuisineType = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const sortBy = req.query.sortBy || "popularity"; // Optional sorting by likes or time
    const mealType = req.query.mealType || ""; // Optional meal type

    // Call the searchRecipes function from the services
    const results = await recipes_services.searchRecipes({
      query,
      resultsCount: number,
      sortBy,
      filterBy: diet,
      cuisineType,
      mealType,
    });

    res.send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const number = req.params.number || 3; // Default to 5 random recipes if no number is provided
    const randomRecipes = await recipes_utils.getRecipesPreviewRandom(number);
    res.send(randomRecipes.data.recipes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
