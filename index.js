const { Client } = require('pg');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


// ბაზასთან კავშირი
const client = new Client({
  user: '',
  host: 'localhost',
  database: 'postgres',
  password: '',
  port: 5432,
});

async function fetchAndStorePrices() {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex');
    const data = await response.json();

     const time = new Date();

    for (const token of data) {
      const { symbol, markPrice } = token;

      // გამოტოვე ტოკენი, თუ ფასი არ არის ხელმისაწვდომი
      if (!markPrice) continue;

      const price = parseFloat(markPrice);

      await client.query(
        'INSERT INTO binance_price(price, time, symbol) VALUES ($1, $2, $3)',
        [price, time, symbol]
      );

      console.log(`✔ ჩაიწერა: ${symbol} - ${price} @ ${time.toISOString()}`);
    }

  } catch (error) {
    console.error('⚠ შეცდომა მონაცემის მიღების ან ჩაწერისას:', error);
  }
}

async function start() {
  try {
    await client.connect();
    console.log('📡 კავშირი წარმატებულია');

    await fetchAndStorePrices();

    setInterval(async () => {
      await fetchAndStorePrices();
    }, 60 * 1000);

  } catch (err) {
    console.error('❌ ვერ მოხერხდა ბაზასთან კავშირი:', err);
  }
}

start();