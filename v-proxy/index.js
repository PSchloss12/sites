const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());

// Define a route that will act as a proxy
app.get('/api', async (req, res) => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateTomorrow = tomorrow.toISOString().split('T')[0];
        const dateToday = today.toISOString().split('T')[0];
        const apiUrl = `https://www.nytimes.com/svc/wordle/v2/${dateToday}.json`;
        
        const response = await axios.get(apiUrl, {
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

app.get('/test', (req,res) => {
    res.json({message: "Test endpoint hit"});
})

// Start the server
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});