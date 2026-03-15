import express from 'express';

const router = express.Router();

// Создание платежа
router.post('/pay', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    console.log('💰 Создание платежа:', { amount, orderId });
    
    // Заглушка для теста
    res.json({
      success: true,
      confirmationUrl: `http://localhost:5173/success?orderId=${orderId}&amount=${amount}`,
      paymentId: `pay_${Date.now()}`,
      note: 'Тестовый платеж'
    });
    
  } catch (error) {
    console.error('Ошибка платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании платежа'
    });
  }
});

export default router;