const DButils = require("./DButils");


async function addToFavorites(username, recipe_id) {
  console.log("watched ", username, recipe_id);

  // Use parameterized query to prevent SQL injection
  const result = await DButils.execQuery(
    `SELECT COUNT(*) as count FROM favorites WHERE user_name = '${username}' AND recipe_id = '${recipe_id}'`
  );

  if (result[0].count === 0) {
    // Insert the new favorite safely using parameterized queries
    await DButils.execQuery(
      `INSERT INTO favorites (user_name, recipe_id) VALUES ('${username}', '${recipe_id}')`

    );
  }
}


async function getFavoriteRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipe_id from watched where user_name='${username}'`
  );
  return recipes_id;
}

async function markAsWatched(username, recipe_id) {
  console.log("watched " , username, recipe_id);
  const result = await DButils.execQuery(
    `SELECT COUNT(*) as count FROM watched WHERE user_name='${username}' AND recipe_id=${recipe_id}`
  );

  if (result[0].count === 0) {
    await DButils.execQuery(
      `INSERT INTO watched (user_name, recipe_id) VALUES ('${username}', ${recipe_id})`
    );
  }
}


async function getWatchedRecipes(username) {
  const recipes_id = await DButils.execQuery(
    `select recipe_id from watched where user_name='${username}'`
  );
  return recipes_id;
}

exports.getFavoriteRecipes = getFavoriteRecipes
exports.addToFavorites = addToFavorites
exports.getWatchedRecipes = getWatchedRecipes
exports.markAsWatched = markAsWatched
// exports.getFavoriteRecipes = getFavoriteRecipes;
