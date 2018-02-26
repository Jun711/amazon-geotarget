/* eslint-env node, mocha */
import { assert, expect } from 'chai';
import { stub } from 'sinon';
import amazon from 'geo-amazon';
import fetchMock from 'fetch-mock';
import GeolocateService from '../src/geolocate';
import AmazonGeotargetService from '../src/amazonGeotarget';
import noIpInfoErrorMsg from '../src/utils/constants';

describe('fn whereabout', () => {
  describe('mock IP services', () => {
    let geolocateIpapiStub;
    let geolocateFreeGeoIpStub;
    const ipapiRes = 'US';
    const freeGeoIpRes = { country_code: 'US' };

    beforeEach(() => {
      geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves(ipapiRes)
      geolocateFreeGeoIpStub = stub(GeolocateService, 'geolocateFreeGeoIp').resolves(freeGeoIpRes);
    });

    afterEach(() => {
      geolocateIpapiStub.restore();
      geolocateFreeGeoIpStub.restore();
    });

    function providerZeroTest(response) {
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      expect(geolocateFreeGeoIpStub.notCalled).to.equal(true);
      expect(response).to.be.a('string');
      expect(response).to.have.lengthOf(2);
      expect(response).to.equal('US');
    }

    function errorHandler(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Service is not available');
    }

    it('whereabout should call IPAPI when no provider specified', (done) => {
      AmazonGeotargetService.whereabout()
        .then((response) => {
          providerZeroTest(response);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('whereabout should call IPAPI when provider 0 specified', (done) => {
      AmazonGeotargetService.whereabout({ provider: 0 })
        .then((response) => {
          providerZeroTest(response);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('whereabout should call IPAPI when provider 0 specified - async await', async () => {
      const response = await AmazonGeotargetService.whereabout({ provider: 0 }).catch((err) => {
        throw err;
      });
      providerZeroTest(response);
    });

    it('whereabout should call FreeGeoIp when provider 1 specified', (done) => {
      AmazonGeotargetService.whereabout({ provider: 1 })
        .then((response) => {
          assert.isObject(response);
          expect(response).to.have.property('country_code');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('whereabout should reject as promised when provider 2 specified', (done) => {
      AmazonGeotargetService.whereabout({ provider: 2 })
        .then(() => {
          assert.fail(0, 1, 'Expected rejected promise');
          done();
        }, (err) => {
          errorHandler(err);
          done();
        });
    });

    it('await - whereabout should reject as promised when provider 2 specified', async () => {
      const response = await AmazonGeotargetService.whereabout({ provider: 2 })
        .catch(err => errorHandler(err));
      expect(response).to.be.an('undefined');
    });
  });

  describe('mock fetch using fetch-mock', () => {
    const ipapiRes = 'US';
    const ipapiUndefined = 'Undefined';
    const freeGeoIpRes = { country_code: 'US' };
    const freeGeoIpUndefined = '404 page not found';

    it('whereabout should returns US using provider 0 and IP from US is specified', async () => {
      fetchMock.get('https://ipapi.co/76.72.167.90/country', ipapiRes);
      const response = await AmazonGeotargetService.whereabout({
        provider: 0,
        ip: '76.72.167.90',
      }).catch((err) => {
        throw err;
      });
      assert.isDefined(response, 'Response is defined')
      assert.isString(response, 'IPAPI returns country code');
      assert.strictEqual(response, 'US');
      fetchMock.restore();
    });

    it('whereabout should returns US using provider 0 and IP is non-existent', async () => {
      // geolocateIPAPI response when IP is not found
      fetchMock.get('https://ipapi.co/1234567/country', ipapiUndefined);
      const response = await AmazonGeotargetService.whereabout({
        provider: 0,
        ip: '1234567',
      }).catch((err) => {
        throw err;
      });
      expect(response).to.be.an('error');
      expect(response.message).to.be.a('string');
      expect(response.message).to.equal(noIpInfoErrorMsg);
      fetchMock.restore();
    });

    it('whereabout should returns US using provider 1 and IP from US is specified', async () => {
      fetchMock.get('https://freegeoip.net/json/50.23.94.74', freeGeoIpRes);
      const response = await AmazonGeotargetService.whereabout({
        provider: 1,
        ip: '50.23.94.74',
      }).catch((err) => {
        throw err;
      });
      expect(response.country_code).to.be.a('string');
      expect(response.country_code).to.have.lengthOf(2);
      assert.strictEqual(response.country_code, 'US');
      fetchMock.restore();
    });

    it('whereabout should returns US using provider 1 and IP is non-existent', async () => {
      // freegeoip response when IP is not found
      fetchMock.get('https://freegeoip.net/json/1234567', freeGeoIpUndefined);
      const response = await AmazonGeotargetService.whereabout({
        provider: 1,
        ip: '1234567',
      }).catch((err) => {
        throw err;
      });
      expect(response).to.be.an('error');
      expect(response.message).to.be.a('string');
      expect(response.message).to.equal(noIpInfoErrorMsg);
      fetchMock.restore();
    });
  });
});

describe('fn amazonAffiliateURL', () => {
  describe('not using amazon stub', () => {
    let amazonGeotargetService;

    beforeEach(() => {
      amazonGeotargetService = new AmazonGeotargetService();
    });

    it('amazonAffiliateURL should return www.amazon.com when no country specified', () => {
      const response = amazonGeotargetService.amazonAffiliateURL();
      assert.strictEqual(response, 'www.amazon.com');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
    });

    it('amazonAffiliateURL should return www.amazon.com when non-existent country specified', () => {
      const response = amazonGeotargetService.amazonAffiliateURL('ABC');
      assert.strictEqual(response, 'www.amazon.com');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
    });

    it('amazonAffiliateURL should return default store if it is set when non-existent country specified', () => {
      const defaultStore = 'www.amazon.co.uk';
      amazonGeotargetService = new AmazonGeotargetService(defaultStore);
      const response = amazonGeotargetService.amazonAffiliateURL('amazon');
      assert.strictEqual(response, defaultStore);
      assert.isString(response, `amazonAffiliateURL returns ${defaultStore}`);
      expect(response).to.be.a('string');
    });

    it('amazonAffiliateURL should return www.amazon.co.uk when GB specified', () => {
      const response = amazonGeotargetService.amazonAffiliateURL('GB');
      assert.strictEqual(response, 'www.amazon.co.uk');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.co.uk');
      expect(response).to.be.a('string');
    });

    it('amazonAffiliateURL should return www.amazon.co.jp when JP specified', () => {
      const response = amazonGeotargetService.amazonAffiliateURL('JP');
      assert.strictEqual(response, 'www.amazon.co.jp');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.co.jp');
      expect(response).to.be.a('string');
    });

    it('amazonAffiliateURL should return www.amazon.de when DE specified', () => {
      const response = amazonGeotargetService.amazonAffiliateURL('DE');
      assert.strictEqual(response, 'www.amazon.de');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.de');
      expect(response).to.be.a('string');
    });
  });

  describe('stub amazon plugin', () => {
    let amazonStoreStub;

    beforeEach(() => {
      amazonStoreStub = stub(amazon, 'store').returns('ABC');
    });

    it('amazonAffiliateURL should return www.amazon.com when non-existent country specified', () => {
      const amazonGeotargetService = new AmazonGeotargetService();
      const response = amazonGeotargetService.amazonAffiliateURL('US');
      assert.strictEqual(response, 'www.amazon.com');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
    });

    it('amazonAffiliateURL should return default store if it is set when non-existent country specified', () => {
      const defaultStore = 'www.amazon.co.uk';
      const amazonGeotargetService = new AmazonGeotargetService(defaultStore);
      const response = amazonGeotargetService.amazonAffiliateURL('US');
      assert.strictEqual(response, defaultStore);
      assert.isString(response, 'amazonAffiliateURL returns default store');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
    });
  });
});

describe('fn amazonGeotarget', () => {
  describe('real service', () => {
    it('amazonGeotarget real service should return US Amazon store URL using IP 199.87.228.66', async () => {
      const amazonGeotargetService = new AmazonGeotargetService();
      const response = await amazonGeotargetService.amazonGeotarget('199.87.228.66').catch((err) => {
        throw err;
      });
      assert.isString(response, 'amazonGeotarget returns Amazon store URL');
      assert.strictEqual(response, 'www.amazon.com');
      expect(response).to.be.a('string');
    });
  });

  describe('stub geolocate', () => {
    let amazonGeotargetService;

    beforeEach(() => {
      amazonGeotargetService = new AmazonGeotargetService();
    });

    it('amazonGeotarget should return US Amazon store URL when using non-existent IP', async () => {
      const geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves('Undefined');
      const response = await amazonGeotargetService.amazonGeotarget('1234567').catch((err) => {
        throw err;
      });
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      assert.isString(response, 'amazonGeotarget returns Amazon store URL');
      assert.strictEqual(response, 'www.amazon.com');
      expect(response).to.be.a('string');
      geolocateIpapiStub.restore();
    });

    it('amazonGeotarget should return default store URL if it is set when using non-existent IP', async () => {
      const geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves('Undefined');
      const defaultStore = 'www.amazon.ca';
      amazonGeotargetService.defaultStore = defaultStore;
      const response = await amazonGeotargetService.amazonGeotarget('1234567').catch((err) => {
        throw err;
      });
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      assert.isString(response, 'amazonGeotarget returns default store URL');
      assert.strictEqual(response, defaultStore);
      expect(response).to.be.a('string');
      geolocateIpapiStub.restore();
    });

    it('amazonGeotarget should return US Amazon if user is in US', async () => {
      const geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves('US');
      const response = await amazonGeotargetService.amazonGeotarget().catch((err) => {
        throw err;
      });
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      assert.isString(response, 'amazonGeotarget returns Amazon store URL');
      assert.strictEqual(response, 'www.amazon.com');
      expect(response).to.be.a('string');
      geolocateIpapiStub.restore();
    });
  });

  describe('stub amazonStore and whereabout ', () => {
    let amazonStoreStub;
    let whereaboutStub;
    let amazonGeotargetService;
    const amazonUS = 'www.amazon.com';

    beforeEach(() => {
      amazonGeotargetService = new AmazonGeotargetService();
    });

    it('amazonGeotarget should return www.amazon.com when amazon.store returns non Amazon URL', async () => {
      amazonStoreStub = stub(amazon, 'store').returns('ABC');
      whereaboutStub = stub(AmazonGeotargetService, 'whereabout').resolves('US');
      const response = await amazonGeotargetService.amazonGeotarget();
      expect(whereaboutStub.calledOnce).to.equal(true);
      expect(amazonStoreStub.calledOnce).to.equal(true);
      assert.strictEqual(response, amazonUS);
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
      whereaboutStub.restore();
    });

    it('amazonGeotarget should return default store if it is set when amazon.store returns non Amazon URL', async () => {
      amazonStoreStub = stub(amazon, 'store').returns('www.google.com');
      whereaboutStub = stub(AmazonGeotargetService, 'whereabout').resolves('US');
      const defaultStore = 'www.amazon.ca';
      amazonGeotargetService = new AmazonGeotargetService(defaultStore);
      const response = await amazonGeotargetService.amazonGeotarget();
      expect(whereaboutStub.calledOnce).to.equal(true);
      expect(amazonStoreStub.calledOnce).to.equal(true);
      assert.strictEqual(response, defaultStore);
      assert.isString(response, 'amazonAffiliateURL returns default store');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
      whereaboutStub.restore();
    });

    it('amazonGeotarget\'s default store has to be set at instantiation', async () => {
      amazonStoreStub = stub(amazon, 'store').returns('www.google.com');
      whereaboutStub = stub(AmazonGeotargetService, 'whereabout').resolves('US');
      const defaultStore = 'www.amazon.ca';
      AmazonGeotargetService.defaultStore = defaultStore;
      const response = await amazonGeotargetService.amazonGeotarget();
      expect(whereaboutStub.calledOnce).to.equal(true);
      expect(amazonStoreStub.calledOnce).to.equal(true);
      assert.notEqual(response, defaultStore);
      assert.strictEqual(response, amazonUS);
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
      whereaboutStub.restore();
    });

    it('amazonGeotarget should return www.amazon.com when whereabout returns undefined', async () => {
      amazonStoreStub = stub(amazon, 'store').returns('ABC');
      whereaboutStub = stub(AmazonGeotargetService, 'whereabout').resolves(undefined);
      const response = await amazonGeotargetService.amazonGeotarget();
      expect(whereaboutStub.calledOnce).to.equal(true);
      expect(amazonStoreStub.notCalled).to.equal(true);
      assert.strictEqual(response, amazonUS);
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
      whereaboutStub.restore();
    });

    it('amazonGeotarget should return default store if it is set when whereabout returns undefined', async () => {
      amazonStoreStub = stub(amazon, 'store').returns('ABC');
      const defaultStore = 'www.amazon.co.jp';
      amazonGeotargetService = new AmazonGeotargetService(defaultStore);
      whereaboutStub = stub(AmazonGeotargetService, 'whereabout').resolves(undefined);
      const response = await amazonGeotargetService.amazonGeotarget();
      expect(whereaboutStub.calledOnce).to.equal(true);
      expect(amazonStoreStub.notCalled).to.equal(true);
      assert.strictEqual(response, defaultStore);
      assert.isString(response, 'amazonAffiliateURL returns default store');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
      whereaboutStub.restore();
    });
  });
});
