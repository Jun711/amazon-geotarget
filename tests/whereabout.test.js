/* eslint-env node, mocha */
import { assert, expect } from 'chai';
import whereabout from '../src/whereabout';

describe('whereabout', () => {
  it('should call FreeGeoIp when no provider specified', (done) => {
    whereabout()
      .then((response) => {
        assert.isString(response, 'IPAPI returns country code');
        expect(response).to.be.a('string');
        expect(response).to.have.lengthOf(2);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should call IPAPI when provider 0 specified', async () => {
    const response = await whereabout(0);
    assert.isString(response, 'IPAPI returns country code');
    expect(response).to.be.a('string');
    expect(response).to.have.lengthOf(2);
  });

  it('should call FreeGeoIp when provider 1 specified', (done) => {
    whereabout(1)
      .then((response) => {
        assert.isObject(response);
        expect(response).to.have.property('country_code');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should rejects as promised when provider 2 specified', (done) => {
    whereabout(2)
      .then(() => {
        assert.fail(0, 1, 'Expected rejected promise');
        done();
      }, (error) => {
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal('Service is not available')
        done();
      });
  });
});
