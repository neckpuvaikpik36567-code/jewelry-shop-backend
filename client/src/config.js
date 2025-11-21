const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://curs-1.onrender.com'
    : 'http://localhost:5000'
};

// Проверяем доступность сервера
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${config.apiUrl}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Сервер недоступен:', error);
    return false;
  }
};

export default config;