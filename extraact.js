const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { extract } = require("@extractus/article-extractor");
const sanitizeHtml = require("sanitize-html");
const dotenv = require("dotenv");
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Set timeout for response
app.use(function(req, res, next) {
    res.setTimeout(10000, () => {
        res.sendStatus(408);
    });
    next();
});
app.get("/", (req, res) => {
    res.send("Hello World! This is the article extractor!");
});
app.post('/scrap', async(req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            res.status(400).json({ error: 'Link is required' });
            return;
        }

        let resp = {};

        try {
            let article = await extract(link);

            if (article !== null) {
                const content = sanitizeHtml(article.content, {
                    allowedTags: [
                        'p',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'div',
                        'article',
                        'ul',
                        'ol',
                    ],
                });

                resp = {
                    content: content,
                    description: article.description,
                };

                res.send(resp);
            } else {
                res.status(500).json({ error: 'Failed to extract article' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log("Server listening on port 3000!");
});