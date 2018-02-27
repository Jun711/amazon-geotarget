import { noIpInfoMsg, serviceNotAvailableMsg } from './utils/constants';

export default class GeolocateService {
  static async geolocateFreeGeoIp(ip) {
    const ipQuery = ip || '';
    const response = await fetch(`https://freegeoip.net/json/${ipQuery}`).then(this.handleError);
    let ipInfo;
    try {
      ipInfo = await response.json();
    } catch (err) {
      throw new Error(noIpInfoMsg);
    }
    // const ipInfo = await response.json().catch(() => );
    return ipInfo;
  }

  static async geolocateIPAPI(ip) {
    const ipQuery = ip ? `${ip}/` : '';
    const response = await fetch(`https://ipapi.co/${ipQuery}country`).then(this.handleError);
    const countryCode = await response.text();
    // const countryCode = await response.text().catch(() => new Error(noIpInfoMsg));
    return countryCode !== 'Undefined' ? countryCode : Promise.reject(new Error(noIpInfoMsg));
  }

  static handleError(response) {
    if (!response.ok) {
      throw new Error(serviceNotAvailableMsg);
    }
    return response;
  }
}
