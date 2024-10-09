import express from 'express';
import cors from 'cors';
import corsAnywhere from 'cors-anywhere';

const app = express();
const port = process.env.PORT || 8080;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://musical-khapse-5244f7.netlify.app'
    : ['http://localhost:5173', 'https://musical-khapse-5244f7.netlify.app']
};

app.use(cors(corsOptions));

// CORS Anywhere route
corsAnywhere.createServer().listen(port, '0.0.0.0', () => {
  console.log(`CORS Anywhere running on http://localhost:${port}`);
});

// Other routes or middleware can go here

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});