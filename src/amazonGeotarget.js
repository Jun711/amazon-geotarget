import amazon from 'geo-amazon';
import GeolocateService from './geolocate';

class AmazonGeotargetService {
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

  static amazonAffiliateURL(countryCode = 'US') {
    let amazonURL;
    try {
      amazonURL = amazon.store(countryCode);
    } catch (err) {
      return 'www.amazon.com';
    }
    return amazonURL.includes('amazon') ? amazonURL : 'www.amazon.com';
  }

  static async amazonGeotarget(ip) {
    const response = await AmazonGeotargetService.whereabout({ ip })
      .catch(() => 'www.amazon.com');
    let countryCode;
    if (typeof response === 'object') {
      if (response.country_code) {
        countryCode = response.country_code;
      }
    } else if (response !== 'Undefined') {
      countryCode = response;
    }
    return AmazonGeotargetService.amazonAffiliateURL(countryCode);
  }
}

export default AmazonGeotargetService;

if (typeof window !== 'undefined'
  && typeof window.amazonGeotarget === 'undefined') {
  window.amazonGeotarget = AmazonGeotargetService.amazonGeotarget;
  window.whereabout = AmazonGeotargetService.whereabout;
}
