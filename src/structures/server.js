const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const data = require('../product_data/cpu/data.json');

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (req, res) => {
    res.json(data);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
