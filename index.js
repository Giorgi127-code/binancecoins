const { Client } = require('pg');


const url = 'https://jsonplaceholder.typicode.com/posts/1';

fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('⚠ შეცდომა:', err));



// ბაზასთან კავშირი
const client = new Client({
  user: '',
  host: 'localhost',
  database: 'postgres',
  password: '',
  port: 5432,
});

// ფუნქცია ფასის მიღებისა და ბაზაში ჩასაწერად
async function fetchAndStorePrices() {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex');
    const data = await response.json();

  const btc = data.find(item => item.symbol === 'BTCUSDT');
  const eth = data.find(item => item.symbol === 'ETHUSDT');
  const sol = data.find(item => item.symbol === 'SOLUSDT');

    if (!btc || !btc.markPrice) {
      console.error('❌ BTCUSDT არ მოიძებნა ან ფასი არ არის ხელმისაწვდომი');
      return;
    }

    const btcPrice = parseFloat(btc.markPrice);
    const ethPrice = parseFloat(eth.markPrice);
    const solPrice = parseFloat(sol.markPrice);
    const time = new Date();

 

await client.query(
  'INSERT INTO binance_price(price, time, symbol) VALUES ($1, $2, $3)',
  [btcPrice, time, 'BTC']
);
console.log(`✔ ჩაიწერა: ${btcPrice} @ ${time.toISOString()}`);

await client.query(
  'INSERT INTO binance_price(price, time, symbol) VALUES ($1, $2, $3)',
  [ethPrice, time, 'ETH']
);
console.log(`✔ ჩაიწერა: ${ethPrice} @ ${time.toISOString()}`);

await client.query(
  'INSERT INTO binance_price(price, time, symbol) VALUES ($1, $2, $3)',
  [solPrice, time, 'SOL']
);
console.log(`✔ ჩაიწერა: ${solPrice} @ ${time.toISOString()}`);

   
  } catch (error) {
    console.error('⚠ შეცდომა მონაცემის მიღების ან ჩაწერისას:', error);
  }
}



// ბაზასთან კავშირის გახსნა და ციკლის დაწყება
async function start() {
  try {
    await client.connect();
    console.log('📡 კავშირი წარმატებით განხორციელდა');

    // პირველად გაიშვას ახლავე
    await fetchAndStorePrices();


    // შემდეგ იმეოროს ყოველ წუთში სამივე
    setInterval(async () => {
      await fetchAndStorePrices();

    }, 60 * 1000);

  } catch (err) {
    console.error('❌ ვერ მოხერხდა ბაზასთან კავშირი:', err);
  }
}


start();





