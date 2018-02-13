async function geolocateFreeGeoIp() {
  const response = await fetch('https://freegeoip.net/json/');
  const ipInfo = await response.json();
  return ipInfo;
}

async function geolocateIPAPI() {
  const response = await fetch('https://ipapi.co/country');
  const countryCode = await response.text();
  return countryCode;
}

export {
  geolocateFreeGeoIp,
  geolocateIPAPI,
};
