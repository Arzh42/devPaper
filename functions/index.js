const functions = require("firebase-functions");
const axios = require("axios");
const pdf = require("html-pdf");
const stream = require("stream");
exports.getPaper = functions.https.onRequest((request, response) => {
  let articles;
  axios
    .get("https://dev.to/api/articles?page=1&per_page=30&tag=javascript&top=7")
    .then((res) => {
      articles = res.data;
      return axios.get("https://dev.to/api/articles/" + articles[0].id);
    })
    .then((article) => {
      console.log(article.data.body_html, cleanHtml(article.data.body_html));
      let html = addArticle(
        basicHeaderPage(),
        article.data.title,
        cleanHtml(article.data.body_html)
      );
      return axios
        .get("https://dev.to/api/articles/" + articles[1].id)
        .then((article) => {
          html = addArticle(
            html,
            article.data.title,
            cleanHtml(article.data.body_html)
          );
          html = addBasicFooterPage(html);
          toPage(html, response);
        });
      /*
      
      */
    });
});
const toPage = (html, response) => {
  response.set("Content-Type", "text/html");
  response.send(html);
};
const toPDF = (html, response) => {
  return pdf.create(html).toBuffer((err, buffer) => {
    var readStream = new stream.PassThrough();
    readStream.end(buffer);
    response.set("Content-disposition", "attachment; filename=mypdf");
    response.set("Content-Type", "application/pdf");
    readStream.pipe(response);
  });
};
const basicHeaderPage = () => {
  return `<body 
    style="" >
    <style type="text/css">
        #main {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
        .article {
            font-size: 12px;
            flex-basis: 100%;
        }
        img {
          max-width: 100%;
        }
    </style><header ><h1>My week in dev</h1></header><div id="main">`;
};

const addBasicFooterPage = (html) => {
  return `
    ${html}
    </div>
    
  </html>`;
};

const addArticle = (html, title, article) => {
  return `${html}<h2>${title}</h2><article class="article" >${article}</article>`;
};

const cleanHtml = (html) => {
  //let newHtml = html.replace(/<iframe[^]*<\/iframe>/, "iframe");

  let newHtml = html.replace(/<h3/, "<h5");
  newHtml = newHtml.replace(/<\/h3>/, "</h5>");

  newHtml = newHtml.replace(/<h2/, "<h4");
  newHtml = newHtml.replace(/<\/h2>/, "</h4>");
  newHtml = newHtml.replace(/<h1/, "<h3");
  newHtml = newHtml.replace(/<\/h1>/, "</h3>");
  return newHtml;
};
