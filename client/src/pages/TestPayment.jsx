import React, { useEffect } from 'react';

function TestPayment() {
  useEffect(() => {
  
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://yookassa.ru/integration/simplepay/css/yookassa_construct_form.css?v=1.34.0';
    document.head.appendChild(link);

  
    const script = document.createElement('script');
    script.src = 'https://yookassa.ru/integration/simplepay/js/yookassa_construct_form.js?v=1.34.0';
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Тестовая оплата YooKassa</h1>
      <p>Введите сумму и нажмите "Заплатить":</p>

      <form
        className="yoomoney-payment-form"
        action="https://yookassa.ru/integration/simplepay/payment"
        method="post"
        acceptCharset="utf-8"
      >
        <div className="ym-payment-btn-block ym-align-space-between">
          <div className="ym-input-icon-rub">
            <input
              name="sum"
              placeholder="0.00"
              className="ym-input ym-sum-input ym-required-input"
              type="number"
              step="any"
            />
          </div>
          <button data-text="Заплатить" className="ym-btn-pay ym-result-price">
            <span className="ym-text-crop">Заплатить</span>
            <span className="ym-price-output"></span>
          </button>
          <img
            src="https://yookassa.ru/integration/simplepay/img/iokassa-gray.svg?v=1.34.0"
            className="ym-logo"
            width="114"
            height="27"
            alt="ЮKassa"
          />
        </div>
        <input name="shopId" type="hidden" value="1372246" />
      </form>
    </div>
  );
}

export default TestPayment;
