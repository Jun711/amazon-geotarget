/* eslint-env node, mocha */
import { assert, expect } from 'chai';
import GeolocateService from '../src/geolocate';

describe('geolocateFreeGeoIp', () => {
  it('should return ipinfo json object', (done) => {
    GeolocateService.geolocateFreeGeoIp()
      .then((response) => {
        assert.isObject(response);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should contain properties as specified in the document', (done) => {
    const responseKeys = ['ip', 'country_code', 'country_name', 'region_code', 'region_name',
      'city', 'zip_code', 'time_zone', 'latitude', 'longitude', 'metro_code'];
    GeolocateService.geolocateFreeGeoIp()
      .then((response) => {
        assert.containsAllKeys(response, responseKeys);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should contain country code property', (done) => {
    GeolocateService.geolocateFreeGeoIp()
      .then((response) => {
        expect(response).to.have.property('country_code');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe('geolocateIPAPI', () => {
  it('should return country code string', (done) => {
    GeolocateService.geolocateIPAPI()
      .then((response) => {
        assert.isString(response, 'IPAPI returns country code');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return country code string', (done) => {
    GeolocateService.geolocateIPAPI()
      .then((response) => {
        expect(response).to.be.a('string');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return country code string that has length 2', (done) => {
    GeolocateService.geolocateIPAPI()
      .then((response) => {
        expect(response).to.have.lengthOf(2);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
