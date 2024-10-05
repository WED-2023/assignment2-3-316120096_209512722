const DButils = require("./DButils");

async function validateUsername(username) {
    const users = await DButils.execQuery(
        `SELECT count(*) FROM users WHERE user_name = '${username}'`
    );
    return users > 0;
}

module.exports = { validateUsername }