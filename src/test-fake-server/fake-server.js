const express = require('express');

const app = express();

app.use(express.json());

let count = 0;

app.post('/webhook', (req, res) => {
  count++;

  console.log('Webhook received');
  console.log(req.body);

  if (count < 3) {
    console.log('Forcing failure');

    return res.status(500).send({
      error: 'Temporary error',
    });
  }

  res.send({
    success: true,
  });
});

app.listen(4000, () => {
  console.log('Fake webhook server running');
});