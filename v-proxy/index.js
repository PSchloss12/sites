const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());

function formatDate(date) {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [d.getFullYear(), month, day].join("-");
}
function formatDate2(date) {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    if (month.length < 2) month = "0" + month;
    return [d.getFullYear(), month].join("");
}
function decrypt(salt, encoded) {
    if (!encoded) return null;
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded.match(/.{1,2}/g).map((hex) => parseInt(hex, 16)).map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode)).join("");
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dateTomorrow = tomorrow.toISOString().split('T')[0];
const dateToday = today.toISOString().split('T')[0];
const todayWordleUrl = `https://www.nytimes.com/svc/wordle/v2/${dateToday}.json`;
const tomorrowWordleUrl = `https://www.nytimes.com/svc/wordle/v2/${dateTomorrow}.json`;
const tradleUrl = "https://tradle.net/data.csv";
const miniUrl = "https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json";
const bandleUrl = `https://sound.bandle.app/answers${formatDate2(new Date())}.txt?d=${Date.now()}`;
const bandleSalt = "isItReallyWorthIt";

app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

app.get('/test', (req,res) => {
    res.json({message: "Test endpoint hit"});
})
app.get('/', (req,res) => {
    res.json({message: "Home endpoint hit"});
})

// Define a route that will act as a proxy
app.get('/wordle', async (req, res) => {
    try {
        const todayWordleResponse = await axios.get(todayWordleUrl, {
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
        const tomorrowWordleResponse = await axios.get(tomorrowWordleUrl, {
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
        res.json({"wordleToday" : todayWordleResponse.data['solution'],
            "wordleTomorrow" : tomorrowWordleResponse.data['solution'],
        });
    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send(`Internal Server Error: ${error}`);
    }
});
app.get('/tradle', async (req, res) => {
    try {
        const tradleResponse = await axios.get(tradleUrl, {
            headers: {
                "Referer": "https://tradle.net/"
                }
        });
        let index = tradleResponse.data.search(dateToday);
        res.json({
            "tradleToday" : tradleResponse.data.slice(index+11, index+13),
            "tradleTomorrow" : tradleResponse.data.slice(index+26, index+28),
        });
    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send(`Internal Server Error: ${error}`);
    }
});

app.get('/mini', async (req,res) => {
    try {
        const miniRes = await axios.get(miniUrl, {
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                "Host": "www.nytimes.com",
                "Referer": "https://www.nytimes.com/crosswords/game/mini",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
            }
        });
        miniBoard = miniRes.data['body'][0]['board'];
        miniCells = miniRes.data['body'][0]['cells'];

        res.json({
            "miniAnswers" : miniCells,
            "miniBoard" : miniBoard,
        });

    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send(`Internal Server Error: ${error}`);
    }
})
app.get('/bandle', async (req,res) => {
    try {
        const res = await axios.get(bandleUrl, {
            headers: {
                // ":authority": "sound.bandle.app",
                // ":scheme": "https",
                "accept": "*/*",
                "accept-encoding": "gzip, deflate, br, zstd",
                "accept-language": "en-US,en;q=0.5",
                "origin": "https://bandle.app",
                "priority": "u=1, i",
                "referer": "https://bandle.app/",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                // "sec-gpc": "1",
              }
        });
        // console.log(res.data);
        const answers = JSON.parse(decrypt(bandleSalt, res.text()));
        const bandleToday = answers.find(x => x.day === formatDate(today));
        const bandleTomorrow = answers.find(x => x.day === formatDate(tomorrow));
        res.json({
            "bandleToday" : bandleToday,
            "bandleTomorrow" : bandleTomorrow
        });

    } catch(error) {
        console.error('Error fetching data:',error);
        res.status(500).send(`Internal Server Error: ${error}`);
    }
})

// Start the server
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});