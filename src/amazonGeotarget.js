import amazon from 'geo-amazon';
import GeolocateService from './geolocate';

class AmazonGeotargetService {
  constructor(defaultStore) {
    this.defaultStore = defaultStore || 'www.amazon.com';
  }

  static async whereabout({ provider = 0, ip } = { provider: 0 }) {
    if (provider > 1) {
      return Promise.reject(new Error('Service is not available'));
    }
    let response = null;
    try {
      if (provider === 0) {
        response = GeolocateService.geolocateIPAPI(ip);
      } else {
        response = GeolocateService.geolocateFreeGeoIp(ip);
      }
    } catch (err) {
      const nextProvider = provider + 1;
      AmazonGeotargetService.whereabout(nextProvider, ip);
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
    const response = await AmazonGeotargetService.whereabout({ ip })
      .catch(() => this.defaultStore);
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
  && typeof window.amazonGeotarget === 'undefined') {
  window.AmazonGeotargetService = AmazonGeotargetService;
  window.whereabout = AmazonGeotargetService.whereabout;
}
