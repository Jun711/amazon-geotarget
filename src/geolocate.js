export default class GeolocateService {
  static async geolocateFreeGeoIp() {
    const response = await fetch('https://freegeoip.net/json/');
    const ipInfo = await response.json();
    return ipInfo;
  }

  static async geolocateIPAPI() {
    const response = await fetch('https://ipapi.co/country');
    const countryCode = await response.text();
    return countryCode;
  }
}
