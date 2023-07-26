const express = require("express");
const app = express();
const axios = require("axios").default;
const crypto = require("crypto");
const querystring = require('querystring');
var API;
var Secret;


app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get("/test", (req, res)=>{
    res.sendFile(__dirname + "/public/PlayPlay/index.html");
});
app.get("/", (req,res)=>{
    res.sendFile("/public/index.html")
});
app.get("/history", (req,res)=>{
    res.sendFile(__dirname + "/public/historyCheck/history.html");
});

async function postreq(obj, APIKey, secretKey) {
    // Initialize variable
    var output;
    const data = obj;
    data.nonce = new Date().getTime();
    const secret_key = secretKey;
    const hmac = crypto.createHmac("sha512", secret_key);

    const dataquery = querystring.stringify(data);
    hmac.update(dataquery);
    const headers = {
        Key: APIKey,
        Sign: hmac.digest("hex")
    };
    
    await axios.post("https://indodax.com/tapi", dataquery, {headers: headers}).then((res)=>{
        output = res.data;
    }).catch((err)=>{
        console.error(err);
    });
    return output;
}

const validationRegex = /[\"\,\.\'\<\>\=\;\.\!\`\\\/\(\)\{\}\[\]]/i;

app.post("/api", (req, res)=>{
    var prohibited = false;
    for (const [key, value] of Object.entries(req.body)) {
        if(validationRegex.test(value)){prohibited = true};
    }

    if (prohibited == false) {
        var api = req.body.api, secret = req.body.secret;
        delete req.body.api;
        delete req.body.secret;
        postreq(req.body, api, secret).then((data)=>{
            var s = data.return;
            res.json(s);
            res.end();
        }).catch((err)=>{console.error(err)});
    } else {
        res.send("PROHIBITED");
    }
});
app.post("/history", (req, res)=>{
    var prohibited = false;
    for (const [key, value] of Object.entries(req.body)) {
        if(validationRegex.test(value)){prohibited = true};
    }

    if (prohibited == false) {
        var obj =
        {
            method: req.body.method,
            pair: req.body.pair
        };
        postreq(obj, req.body.api, req.body.secret).then((data)=>{
            var s = data.return.trades;
            res.json(s);
            res.end();
        }).catch((err)=>{console.error(err)});
    } else {
        res.send("PROHIBITED");
    }
});
app.listen(process.env.PORT || 3000);