const express = require('express');
const axios = require('axios');
const app = express();
const comics = JSON.parse(require('fs').readFileSync('comics.json', 'utf-8'));
const comicnums = Object.keys(comics);
const cimocs = JSON.parse(require('fs').readFileSync('cimocs.json', 'utf-8'));
const cimocnums = Object.keys(cimocs);
const path = require('path');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
comicnums.sort((x, y) => parseFloat(x) - parseFloat(y));
cimocnums.sort((x, y) => parseFloat(x) - parseFloat(y));

app.use('/static', express.static(path.join(__dirname, 'static')));

async function comic39(ip) {
  imgs = [];
  console.log(ip);
  const weather = (await axios.get(`http://api.weatherapi.com/v1/current.json?key=9e4fc4d931c649c2a1e142817222307&q=${ip}&days=1&aqi=no&alerts=no`)).data;
  const time = weather.location.localtime;
  const [ymd, hm] = time.split(' ');
  const [hour, minute] = hm.split(':');
  if (hour < 5)
    return [`39-its-early.png`];
  if (hour > 20)
    return [`39-its-late-${hour}.png`];
  switch (weather.current.condition.code) {
    case 1000:
    case 1003:
    case 1006:
      if (weather.current.temp_c <= 10)
        return [`39-cold.png`];
      if (weather.current.temp_c <= 25)
        return [`39-nice.png`];
      if (weather.current.temp_c <= 40)
        return [`39-warm.png`];
      return [`39-burn.png`];
    // case 1003:
    // case 1006:
    //   return [`39-cloudy.png`];
    case 1135:
    case 1147:
      return [`39-fog.png`];
    case 1069:
    case 1204:
    case 1207:
    case 1237:
    case 1249:
    case 1252:
    case 1261:
    case 1264:
      return [`39-hail.png`];
    case 1063:
    case 1168:
    case 1171:
    case 1180:
    case 1183:
    case 1186:
    case 1192:
    case 1195:
    case 1198:
    case 1201:
    case 1240:
    case 1243:
    case 1246:
    case 1276:
      return [`39-raining.png`];
    default:
      return [`39-out-of-whack.gif`];
  }
}

app.get('/comic/:comicnum', async (req, res) => {
  // console.log(req);
  let comicnum = req.params.comicnum;
  if (comicnum == '22') {
    res.render('error', { error: `Comic number ${req.params.comicnum} has not been created yet,\nas creating an entire interactive webcomic is REALLY HARD.` });
  }
  if (!(comicnum in comics)) {
    res.render('error', { error: `We couldn't find comic number ${req.params.comicnum}.` });
  }
  let {date, imgs, caption} = comics[comicnum];
  if (comicnum == 39) {
    const ips = req.get('X-Forwarded-For').split(', ');
    const ip = ips[ips.length - 1];
    imgs = await comic39(ip);
  }
  res.render('comic', { comicnum, date, imgs, caption });
});

app.get('/cimoc/:cimocnum', (req, res) => {
  let cimocnum = req.params.cimocnum;
  if (!(cimocnum in cimocs)) {
    res.render('error', { error: `We couldn't find cimoc number ${req.params.comicnum}.` });
  }
  let {date, imgs, caption, tweet} = cimocs[cimocnum];
  res.render('cimoc', { cimocnum, date, imgs, caption, tweet });
});

app.get('/', (req, res) => {
  res.render('index', { comicnums, cimocnums, comics, cimocs });
});

app.listen(process.env.PORT | 0 || 5000, () => console.log('listening'));