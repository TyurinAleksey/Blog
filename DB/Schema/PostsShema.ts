const createPostsSchema = async (connection) => {
    try {
        const createPostsTableQuery = `
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title TEXT NOT NULL,
                text TEXT NOT NULL,
                imageUrl VARCHAR(255),
                viewsCount INT DEFAULT 0,
                authorId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (authorId) REFERENCES users(id)
            );
        `;

        const createTagsTableQuery = `
            CREATE TABLE IF NOT EXISTS tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                postId INT,
                tag VARCHAR(50),
                FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
            );
        `;

        const createCommentsTableQuery = `
            CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            postId INT NOT NULL,
            usersId INT NOT NULL,
            comment TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (usersId) REFERENCES users(id) ON DELETE CASCADE
        );
        `;

        await connection.query(createPostsTableQuery);
        await connection.query(createTagsTableQuery);
        await connection.query(createCommentsTableQuery);
    } catch (error) {
        console.error("Ошибка при создании таблиц:", error);
        throw error;
    }
};

export default createPostsSchema;