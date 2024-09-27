-- Create the 'users' table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,  -- AUTO_INCREMENT for MySQL
    first_name TEXT,
    last_name TEXT,
    country TEXT,
    password TEXT,
    email VARCHAR(255) UNIQUE               -- Changed from TEXT to VARCHAR(255)
);

-- Create the 'favorites' table
CREATE TABLE favorites (
    user_id INTEGER,
    recipe_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- Create the 'watched' table
CREATE TABLE watched (
    user_id INTEGER,
    recipe_id INTEGER,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Tracks when the recipe was watched
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- Create the 'user_created_recipes' table
CREATE TABLE user_created_recipes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    recipe_title VARCHAR(255) NOT NULL,
    recipe_image TEXT,
    description TEXT,
    ready_in_minutes INT,
    instructions TEXT,
    ingredients TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create the 'recipes' table
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT,
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    image TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);