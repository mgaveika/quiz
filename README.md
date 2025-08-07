# Quiz App

A full-stack web application for creating, taking, and managing quizzes. Built with React, Express, MongoDB, and TailwindCSS.

---

## Features

- User registration and authentication (JWT, cookies)
- Create, ~~edit~~, and delete quizzes
- Add multiple questions and options per quiz
- Take quizzes and see instant feedback
- View quiz results and scores
- Responsive UI with TailwindCSS
- Toast notifications for actions
- Protected routes for authenticated users

---

## Tech Stack

**Frontend:**
- [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Hot Toast](https://react-hot-toast.com/)
- [Vite](https://vitejs.dev/) (dev server & build tool)

**Backend:**
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/) (authentication)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [CORS](https://www.npmjs.com/package/cors)
- [Morgan](https://www.npmjs.com/package/morgan) (logging)

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/mgaveika/quiz.git
cd quiz-app
```

### 2. Install dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

### 3. Environment setup

#### Backend

Create a `.env` file in the `server` folder:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/quizapp
JWT_SECRET=your_jwt_secret
```

#### Frontend

No environment variables needed for local dev.

### 4. Start MongoDB

Make sure your MongoDB server is running locally or update `MONGO_URI` for Atlas.

### 5. Run the app

#### Backend

```bash
cd server
npm start
```

#### Frontend

```bash
cd client
npm run dev
```

The frontend will be available at [http://localhost:3303](http://localhost:3303) and will proxy API requests to the backend.

---

## Usage

- Register a new account or login.
- Create quizzes with multiple questions and options.
- Take quizzes, select answers, and submit.
- View your results and scores.

---

## Folder Structure

```
client/
  src/
    components/
    pages/
    utils/
  public/
server/
  models/
  routes/
  services/
  middleware/
```

---

## Customization & Development

- **Styling:** Uses TailwindCSS, edit `client/src/index.css` for custom backgrounds/themes.
- **API:** All endpoints are under `/api/` (see `server/routes/`).
- **Authentication:** JWT stored in HTTP-only cookies.

---

## License

MIT

---

## Credits

Made by Māris Gaveika.  
Inspired by quiz platforms
