-- Create the 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- AUTO_INCREMENT for MySQL
    user_name VARCHAR(255) NOT NULL UNIQUE,    -- Ensure user_name is unique
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    country VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE           -- Changed from TEXT to VARCHAR(255)
);

-- Create the 'recipes' table
CREATE TABLE IF NOT EXISTS recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    image TEXT,
    user_name VARCHAR(255),
    CONSTRAINT fk_user_name FOREIGN KEY (user_name) REFERENCES users(user_name) ON DELETE CASCADE
);

-- Create the 'favorites' table (without recipe_id as foreign key)
CREATE TABLE IF NOT EXISTS favorites (
    user_name VARCHAR(255),  -- Reference user_name instead of user_id
    recipe_id INT,           -- recipe_id is not a foreign key now
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_name) REFERENCES users(user_name) ON DELETE CASCADE
);

-- Create the 'watched' table (without recipe_id as foreign key)
CREATE TABLE IF NOT EXISTS watched (
    user_name VARCHAR(255),  -- Reference user_name instead of user_id
    recipe_id INT,           -- recipe_id is not a foreign key now
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Tracks when the recipe was watched
    CONSTRAINT fk_watched_user FOREIGN KEY (user_name) REFERENCES users(user_name) ON DELETE CASCADE
);

-- Create the 'user_created_recipes' table
CREATE TABLE IF NOT EXISTS user_created_recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255),  -- Reference user_name instead of user_id
    recipe_title VARCHAR(255) NOT NULL,
    recipe_image TEXT,
    description TEXT,
    ready_in_minutes INT,
    instructions TEXT,
    ingredients TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_created_recipes_user FOREIGN KEY (user_name) REFERENCES users(user_name) ON DELETE CASCADE
);
