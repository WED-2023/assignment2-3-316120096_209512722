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

router.get("/sorted/:username", async (req, res, next) => {
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

const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const { execQuery } = require('./utils/DButils'); // Adjust the path to your DButils module

// Multer configuration with absolute path and file type filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File type validation to accept only images
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValidMimeType = allowedTypes.test(file.mimetype);
  const isValidExtName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValidMimeType && isValidExtName) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Route handler for adding a user recipe
const mysql = require('mysql2'); // Import the mysql2 module

router.post(
  '/addUserRecipe/:username',
  upload.single('image'),
  async (req, res) => {
    try {
      // Parse the instructions and ingredients from JSON strings to objects
      const instructions = JSON.parse(req.body.instructions);
      const ingredients = JSON.parse(req.body.ingredients);

      // Data validation schema using Joi
      const recipeSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        readyInMinutes: Joi.number().integer().required(),
        instructions: Joi.array().items(Joi.string()).min(1).required(),
        ingredients: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              amount: Joi.number().required(),
              unit: Joi.string().required(),
            })
          )
          .min(1)
          .required(),
      });

      // Validate the incoming data
      const { error } = recipeSchema.validate({
        title: req.body.title,
        description: req.body.description,
        readyInMinutes: parseInt(req.body.readyInMinutes, 10),
        instructions: instructions,
        ingredients: ingredients,
      });

      if (error) {
        // Return validation error to the client
        return res.status(400).send({ message: error.details[0].message });
      }

      // Verify that the user exists in the database
      const userCheckQuery = `SELECT 1 FROM users WHERE user_name = '${req.params.username}'`;
      const userExists = await execQuery(userCheckQuery);

      if (userExists.length === 0) {
        // User does not exist
        return res.status(400).send({ message: 'User does not exist.' });
      }

      // Prepare recipe details for insertion
      const recipeDetails = {
        user_name: req.params.username,
        recipe_title: req.body.title,
        recipe_image: req.file ? req.file.filename : null,
        description: req.body.description,
        ready_in_minutes: parseInt(req.body.readyInMinutes, 10),
        instructions: JSON.stringify(instructions),
        ingredients: JSON.stringify(ingredients),
      };

      // Insert the recipe into the database using escaped variables
      const insertQuery = `
        INSERT INTO user_created_recipes
        (user_name, recipe_title, recipe_image, description, ready_in_minutes, instructions, ingredients)
        VALUES (
          ${mysql.escape(recipeDetails.user_name)},
          ${mysql.escape(recipeDetails.recipe_title)},
          ${mysql.escape(recipeDetails.recipe_image)},
          ${mysql.escape(recipeDetails.description)},
          ${mysql.escape(recipeDetails.ready_in_minutes)},
          ${mysql.escape(recipeDetails.instructions)},
          ${mysql.escape(recipeDetails.ingredients)}
        )
      `;
      console.log("query", insertQuery);
      await execQuery(insertQuery);

      // Successfully added the recipe
      res.status(200).send({ message: 'Recipe added', success: true });
    } catch (error) {
      // Log the error and send a generic error message to the client
      console.error('Error adding recipe:', error);
      res.status(500).send({ message: 'An unexpected error occurred.' });
    }
  }
);
// Route handler for getting user recipes
router.get('/myRecipes/:username', async (req, res) => {
  try {
    const username = req.params.username;

    // Query to get recipes created by the user
    const getRecipesQuery = `
      SELECT
        id,
        recipe_title,
        recipe_image,
        description,
        ready_in_minutes
      FROM user_created_recipes
      WHERE user_name = ${mysql.escape(username)}
    `;

    const recipes = await execQuery(getRecipesQuery);

    // Map the database fields to the required recipe structure
    const mappedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      image: recipe.recipe_image
        ? `${req.protocol}://${req.get('host')}/uploads/${recipe.recipe_image}`
        : null,
      title: recipe.recipe_title,
      readyInMinutes: recipe.ready_in_minutes,
      aggregateLikes: 0, 
      vegetarian: false, 
      vegan: false,      
      glutenFree: false, 
      summary: recipe.description,
    }));

    res.status(200).json(mappedRecipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).send({ message: 'An unexpected error occurred.' });
  }
});

module.exports = router;




