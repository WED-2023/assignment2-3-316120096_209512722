var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

// /**
//  * Authenticate all incoming requests by middleware
//  */
// router.use(async function (req, res, next) {
//   if (req.session && req.session.user_id) {
//     DButils.execQuery("SELECT user_id FROM users").then((users) => {
//       if (users.find((x) => x.user_id === req.session.user_id)) {
//         req.user_id = req.session.user_id;
//         next();
//       }
//     }).catch(err => next(err));
//   } else {
//     res.sendStatus(401);
//   }
// });

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */

router.get("/favorites/:username", async (req, res, next) => {
  try {
    const userName = req.params.username;

    if (!userName) {
      return res.status(400).send("Bad Request: Username is required");
    }

    // Call the updated getWatchedRecipes function with the provided userName
    const favorties = await user_utils.getFavoriteRecipes(userName);

    res.status(200).send(favorties); // Return the list of watched recipes
  } catch (error) {
    next(error); // Handle any errors that occur
  }
});

router.get("/getwatched/:username", async (req, res, next) => {
  try {
    const userName = req.params.username;

    if (!userName) {
      return res.status(400).send("Bad Request: Username is required");
    }

    // Call the updated getWatchedRecipes function with the provided userName
    const watched_recipes = await user_utils.getWatchedRecipes(userName);

    res.status(200).send(watched_recipes); // Return the list of watched recipes
  } catch (error) {
    next(error); // Handle any errors that occur
  }
});
router.post("/postwatched", async (req, res, next) => {
  try {
    const { userName, recipeId } = req.body; // Destructure the userName and recipeId from the request body

    if (!userName || !recipeId) {
      return res
        .status(400)
        .send("Bad Request: Username and Recipe ID are required");
    }

    // Call the updated markAsWatched function with the provided userName and recipeId
    await user_utils.markAsWatched(userName, recipeId);

    res.status(200).send("The Recipe successfully marked as watched");
  } catch (error) {
    if (error.message.includes("already watched")) {
      res
        .status(400)
        .send({ message: "The Recipe is already marked as watched" });
    } else {
      next(error); // Handle any other errors
    }
  }
});
router.post("/favorites", async (req, res, next) => {
  try {
    const { userName, recipeId } = req.body; // Destructure the userName and recipeId from the request body

    if (!userName || !recipeId) {
      return res
        .status(400)
        .send("Bad Request: Username and Recipe ID are required");
    }
    // Call the updated markAsWatched function with the provided userName and recipeId
    await user_utils.addToFavorites(userName, recipeId);

    res.status(200).send("The Recipe successfully marked as favorite");
  } catch (error) {
    if (error.message.includes("already watched")) {
      res
        .status(400)
        .send({ message: "The Recipe is already marked as favorite" });
    } else {
      next(error); // Handle any other errors
    }
  }
});

router.get("/Sorted/:username", async (req, res, next) => {
  try {
    console.log("getwatchedSorted");
    const userName = req.params.username;
    console.log("userName : ", userName, "watchedSortesd");
    if (!userName) {
      return res.status(400).send("Bad Request: Username is required");
    }

    // Call the updated getWatchedRecipes function with the provided userName
    const watched_recipes = await user_utils.getWatchedRecipesByAmountSort(
      userName
    );

    res.status(200).send(watched_recipes); // Return the list of watched recipes
  } catch (error) {
    console.error("Error response:", error.response);
    next(error); // Handle any errors that occur
  }
});

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/addUserRecipe/:username",
  upload.single("recipe_image"),
  async (req, res, next) => {
    try {
      console.log("request : ", req.body);

      let recipeDetails = {
        username: req.params.username,
        recipe_title: req.body.title,
        recipe_image: req.file ? req.file.filename : null,
        description: req.body.description,
        ready_in_minutes: req.body.readyInMinutes,
        instructions: JSON.stringify(req.body.instructions),
        ingredients: JSON.stringify(req.body.ingredients),
      };

      const insertQuery = `
      INSERT INTO user_created_recipes 
      (user_name, recipe_title, recipe_image, description, ready_in_minutes, instructions, ingredients) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      await DButils.execQuery(insertQuery, [
        recipeDetails.username,
        recipeDetails.recipe_title,
        recipeDetails.recipe_image,
        recipeDetails.description,
        recipeDetails.ready_in_minutes,
        recipeDetails.instructions,
        recipeDetails.ingredients,
      ]);

      res.status(200).send({ message: "Recipe added", success: true });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
