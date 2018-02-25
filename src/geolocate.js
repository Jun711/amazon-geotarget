import noIpInfoErrorMsg from './utils/constants';

export default class GeolocateService {
  static async geolocateFreeGeoIp(ip) {
    const ipQuery = ip || '';
    const response = await fetch(`https://freegeoip.net/json/${ipQuery}`);
    const ipInfo = await response.json().catch(() => new Error(noIpInfoErrorMsg));
    return ipInfo;
  }

  static async geolocateIPAPI(ip) {
    const ipQuery = ip ? `${ip}/` : '';
    const response = await fetch(`https://ipapi.co/${ipQuery}country`);
    const countryCode = await response.text().catch(() => new Error(noIpInfoErrorMsg));
    return countryCode !== 'Undefined' ? countryCode : new Error(noIpInfoErrorMsg);
  }
}
