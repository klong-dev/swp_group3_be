# SWP Mentor Booking - Backend
## Description
This project is a Node.js application using Express.js framework. It serves static files, handles routes, and connects to a database. The application also supports CORS and parses incoming request bodies.

## Features
- Serves static files from the [`public`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fuser%2FDesktop%2FVSCode%2FExpressJS%2Fswp_master%2Fsrc%2Findex.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A18%2C%22character%22%3A45%7D%7D%5D%2C%22b6525f5b-3883-4aca-ad6f-b43345eda5ef%22%5D "Go to definition") directory
- Parses URL-encoded and JSON request bodies
- Supports Cross-Origin Resource Sharing (CORS)
- Connects to a database
- Handles routing through a separate [`routes`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2Fuser%2FDesktop%2FVSCode%2FExpressJS%2Fswp_master%2Fsrc%2Findex.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A2%2C%22character%22%3A6%7D%7D%5D%2C%22b6525f5b-3883-4aca-ad6f-b43345eda5ef%22%5D "Go to definition") module

## Prerequisites
- Node.js
- npm (Node Package Manager)

## Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd <project-directory>
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

## Configuration
1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables to the `.env` file:
   ```env
   PORT=5000
   DB_HOST=<your-database-host>
   DB_USER=<your-database-user>
   DB_PASS=<your-database-password>
   DB_NAME=<your-database-name>
   ```

## Usage
1. Start the server:
   ```sh
   npm start
   ```
2. The server will be running at `http://localhost:5000`.

## Project Structure
```
.
├── config
│   └── db
│       └── index.js
├── public
│   └── (static files)
├── routes
│   └── index.js
├── .env
├── index.js
├── package.json
└── README.md
```

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## Acknowledgements
- [Express.js](https://expressjs.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [cors](https://www.npmjs.com/package/cors)

[Frontend Repository](https://github.com/baotrongnh/swp_group3_fe)
