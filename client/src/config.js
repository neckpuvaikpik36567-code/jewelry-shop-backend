const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://curs-1.onrender.com'  // Ваш бэкенд на Render
    : 'http://localhost:5000'
};

export default config;