# AmazonGeotarget

[![Build Status](https://travis-ci.org/Jun711/amazon-geotarget.svg?branch=master)](https://travis-ci.org/Jun711/amazon-geotarget)
[![Coverage Status](https://coveralls.io/repos/github/Jun711/amazon-geotarget/badge.svg?branch=master)](https://coveralls.io/github/Jun711/amazon-geotarget?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/Jun711/amazon-geotarget.svg)](https://greenkeeper.io/)

This script can detect user's location based on IPs
and returns Amazon geotargeted URLs.

## Usage
```javascript
const amazonGeotargetService = new AmazonGeotargetService();
amazonGeotargetService.amazonGeotarget().then(res => console.log(res));  
  
// To use it with 'www.amazon.co.uk' as the default store
const amazonGeotargetService = new AmazonGeotargetService('www.amazon.co.uk');
amazonGeotargetService.amazonGeotarget().then(res => console.log(res));
```

Refer to index.html for usage on a webpage.

## IP Sources
IP service providers:
https://ipapi.co/  
https://freegeoip.net/

