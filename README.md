# Movie Review Application

A full-stack application for movie reviews and ratings using TMDB API, built with React, Node.js, and MongoDB.

## Project Structure

```
movie-review-project/
├── movie-review-app/     # Frontend (React)
├── movie-review-backend/ # Backend (Node.js/Express)
└── package.json         # Root package.json for shared scripts
```

## Features

- User authentication (signup/login)
- Browse movies from TMDB API
- Search movies by title
- Filter movies by genre
- Add movies to favorites
- Write and manage movie reviews
- Rate movies
- Responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI components
- React Router for navigation
- Axios for API requests
- JWT for authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- CORS enabled
- TMDB API integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- TMDB API key

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_key_here
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-review-project
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd movie-review-app
npm install

# Install backend dependencies
cd ../movie-review-backend
npm install
```

3. Set up environment variables:
- Create `.env` files in both frontend and backend directories
- Fill in the required environment variables as shown above

4. Start the development servers:
```bash
# From the root directory
npm run dev
```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 