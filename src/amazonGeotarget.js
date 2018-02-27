import amazon from 'geo-amazon';
import GeolocateService from './geolocate';
import { serviceNotAvailableMsg } from './utils/constants';

class AmazonGeotargetService {
  constructor(defaultStore) {
    this.defaultStore = defaultStore || 'www.amazon.com';
  }

  static async whereabout({ provider = 0, ip } = { provider: 0 }) {
    if (provider > 1) {
      return Promise.reject(new Error(serviceNotAvailableMsg));
    }
    let response = null;
    try {
      if (provider === 0) {
        response = await GeolocateService.geolocateIPAPI(ip);
      } else {
        response = await GeolocateService.geolocateFreeGeoIp(ip);
      }
    } catch (err) {
      const nextProvider = provider + 1;
      return AmazonGeotargetService.whereabout({ provider: nextProvider, ip });
    }
    return response;
  }

  amazonAffiliateURL(countryCode = 'US') {
    let amazonURL;
    try {
      amazonURL = amazon.store(countryCode);
    } catch (err) {
      return this.defaultStore;
    }
    return amazonURL.includes('amazon') ? amazonURL : this.defaultStore;
  }

  async amazonGeotarget(ip) {
    let response;
    try {
      response = await AmazonGeotargetService.whereabout({ ip });
    } catch (err) {
      return this.defaultStore;
    }
    let countryCode;
    if (typeof response === 'object') {
      if (response.country_code) {
        countryCode = response.country_code;
      }
    } else if (response !== 'Undefined') {
      countryCode = response;
    }
    if (!countryCode) {
      return this.defaultStore;
    }
    return this.amazonAffiliateURL(countryCode);
  }
}

export default AmazonGeotargetService;

if (typeof window !== 'undefined'
  && typeof window.AmazonGeotargetService === 'undefined') {
  window.AmazonGeotargetService = AmazonGeotargetService;
  window.whereabout = AmazonGeotargetService.whereabout;
}
