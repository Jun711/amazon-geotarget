import amazon from 'geo-amazon';
import GeolocateService from './geolocate';

class AmazonGeotargetService {
  static async whereabout(provider = 0) {
    if (provider > 1) {
      return Promise.reject(new Error('Service is not available'));
    }
    let response = null;
    try {
      if (provider === 0) {
        response = GeolocateService.geolocateIPAPI();
      } else {
        response = GeolocateService.geolocateFreeGeoIp();
      }
    } catch (err) {
      const nextProvider = provider + 1;
      AmazonGeotargetService.whereabout(nextProvider);
    }

    return response;
  }

  static amazonAffiliateURL(countryCode = 'US') {
    return amazon.store(countryCode);
  }

  static async amazonGeotarget() {
    const response = await AmazonGeotargetService.whereabout();
    const countryCode = typeof response === 'object' ? response.country_code : response;

    return AmazonGeotargetService.amazonAffiliateURL(countryCode);
  }
}

export default AmazonGeotargetService;

if (typeof window !== 'undefined'
  && typeof window.amazonGeotarget === 'undefined') {
  window.amazonGeotarget = AmazonGeotargetService.amazonGeotarget;
  window.whereabout = AmazonGeotargetService.whereabout;
}
