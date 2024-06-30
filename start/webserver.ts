import http from "http";

// const r = {
// auth_date: 1719709512,
// first_name: "Serhio",
// hash: "b7fbd34c0a148975874deddc4f18deaaca81ea17f182b8c488348ce73f98d989",
// id: 1074112709,
// last_name: "Toretto",
// photo_url: "https://t.me/i/userpic/320/m1cKCOi1wqt_yxYI9asJGj0rlBUbQ1Ad2omOK2ToeXY.jpg",
// username: "serhio_toretto",
// }

const resHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Telegram Login Widget</title>
</head>
<body>
<p>Would you like to enter via Telegram?</p>
<!--<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="click_claim_serhio_bot" data-size="large" data-auth-url="https://t.me/click_claim_serhio_bot?authorize" data-request-access="write"></script>-->
<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="click_claim_serhio_bot" data-size="large" data-onauth="onTelegramAuth(user)" data-request-access="write"></script>
<script type="text/javascript">
  function onTelegramAuth(user) {
      console.log(user)
      location.href = 'https://t.me/click_claim_serhio_bot?start='+user.hash;
    // alert('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
  }
</script>
</body>
</html>
`

// Creating server
const webServer = http.createServer((_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(resHTML);
})

// Server listening to port 3000
webServer.listen((3000), () => {
    console.log("Server is Running");
})
