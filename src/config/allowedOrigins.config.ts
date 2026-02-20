const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://mydoshbox.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "https://doshbox-administration-app.vercel.app",
  "https://mediator-resolution-app.vercel.app",
].filter(Boolean);

export default allowedOrigins;
