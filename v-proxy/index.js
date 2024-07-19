const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dateTomorrow = tomorrow.toISOString().split('T')[0];
const dateToday = today.toISOString().split('T')[0];
const todayWordleUrl = `https://www.nytimes.com/svc/wordle/v2/${dateToday}.json`;
const tomorrowWordleUrl = `https://www.nytimes.com/svc/wordle/v2/${dateTomorrow}.json`;
const tradleUrl = "https://tradle.net/data.csv";

// const reader = new FileReader();
// reader.onload = function(e) {
//     const text = e.target.result;
//     const rows = text.split('\n').map(row => row.split(','));
//     console.log(JSON.stringify(rows, null, 2));
// };
// const reader = new FileReader();

app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});
// Define a route that will act as a proxy
app.get('/wordle/today', async (req, res) => {
    try {
        const response = await axios.get(todayWordleUrl, {
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "www.nytimes.com",
                "Referer": "https://www.nytimes.com/games/wordle/index.html",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                }
        });
        res.json(response.data);
    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/wordle/tomorrow', async (req, res) => {
    try {
        const response = await axios.get(tomorrowWordleUrl, {
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "www.nytimes.com",
                "Referer": "https://www.nytimes.com/games/wordle/index.html",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                }
        });
        res.json(response.data);
    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/tradle', async (req, res) => {
    try {
        const response = await axios.get(tradleUrl, {
            headers: {
                "Referer": "https://tradle.net/"
                }
        });
        res.json(response.data);
    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/test', (req,res) => {
    res.json({message: "Test endpoint hit"});
})
app.get('/', (req,res) => {
    res.json({message: "Home endpoint hit"});
})
app.get('/api', async (req,res) => {
    try {
        const response0 = await axios.get(todayWordleUrl, {
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "www.nytimes.com",
                "Referer": "https://www.nytimes.com/games/wordle/index.html",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                }
        });
        const response1 = await axios.get(tomorrowWordleUrl, {
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "www.nytimes.com",
                "Referer": "https://www.nytimes.com/games/wordle/index.html",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                }
        });
        const response2 = await axios.get(tradleUrl, {
            headers: {
                "Referer": "https://tradle.net/"
                }
        });
        let index = response2.data.search(dateToday);
        res.json([
            response0.data['solution'],
            response1.data['solution'],
            response2.data.slice(index+11, index+13),
            response2.data.slice(index+26, index+28),
        ]);
    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send('Internal Server Error');
    }
})

// Start the server
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});