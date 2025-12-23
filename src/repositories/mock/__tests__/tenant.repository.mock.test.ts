/**
 * Mock Tenant Repository Tests
 */

import { MockTenantRepository } from '../tenant.repository.mock';

describe('MockTenantRepository', () => {
  let repository: MockTenantRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    repository = new MockTenantRepository();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // Helper to run async operations with fake timers
  const runWithTimers = async <T>(promise: Promise<T>): Promise<T> => {
    jest.runAllTimers();
    return promise;
  };

  describe('getTenants', () => {
    it('should return all tenants', async () => {
      const tenants = await runWithTimers(repository.getTenants());

      expect(tenants).toBeInstanceOf(Array);
      expect(tenants.length).toBeGreaterThan(0);
    });

    it('should return tenants with required properties', async () => {
      const tenants = await runWithTimers(repository.getTenants());

      tenants.forEach(tenant => {
        expect(tenant).toHaveProperty('id');
        expect(tenant).toHaveProperty('slug');
        expect(tenant).toHaveProperty('name');
        expect(tenant).toHaveProperty('country');
        expect(tenant).toHaveProperty('countryCode');
        expect(tenant).toHaveProperty('currency');
        expect(tenant).toHaveProperty('branding');
        expect(tenant).toHaveProperty('features');
      });
    });

    it('should return tenants from multiple countries', async () => {
      const tenants = await runWithTimers(repository.getTenants());
      const countries = new Set(tenants.map(t => t.country));

      expect(countries.size).toBeGreaterThan(1);
    });

    it('should include Ecuador tenants', async () => {
      const tenants = await runWithTimers(repository.getTenants());
      const ecuadorTenants = tenants.filter(t => t.countryCode === 'EC');

      expect(ecuadorTenants.length).toBeGreaterThan(0);
    });

    it('should return a copy of tenants array', async () => {
      const tenants1 = await runWithTimers(repository.getTenants());
      const tenants2 = await runWithTimers(repository.getTenants());

      expect(tenants1).not.toBe(tenants2);
      expect(tenants1).toEqual(tenants2);
    });
  });

  describe('getTenantById', () => {
    it('should return tenant by ID', async () => {
      const tenant = await runWithTimers(repository.getTenantById('1'));

      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe('1');
    });

    it('should return undefined for non-existent ID', async () => {
      const tenant = await runWithTimers(repository.getTenantById('99999'));

      expect(tenant).toBeUndefined();
    });

    it('should return tenant with branding info', async () => {
      const tenant = await runWithTimers(repository.getTenantById('1'));

      expect(tenant?.branding).toBeDefined();
      expect(tenant?.branding?.primaryColor).toBeDefined();
      expect(tenant?.branding?.logoUrl).toBeDefined();
    });

    it('should return tenant with features', async () => {
      const tenant = await runWithTimers(repository.getTenantById('1'));

      expect(tenant?.features).toBeDefined();
      expect(tenant?.features?.cards).toBeDefined();
    });
  });

  describe('getTenantBySlug', () => {
    it('should return tenant by slug', async () => {
      const tenant = await runWithTimers(repository.getTenantBySlug('bpichincha'));

      expect(tenant).toBeDefined();
      expect(tenant?.slug).toBe('bpichincha');
    });

    it('should return undefined for non-existent slug', async () => {
      const tenant = await runWithTimers(repository.getTenantBySlug('nonexistent-slug'));

      expect(tenant).toBeUndefined();
    });

    it('should be case-sensitive', async () => {
      const tenant = await runWithTimers(repository.getTenantBySlug('BPICHINCHA'));

      // Mock data uses lowercase slugs
      expect(tenant).toBeUndefined();
    });
  });

  describe('searchTenants', () => {
    it('should return all tenants for empty query', async () => {
      const allTenants = await runWithTimers(repository.getTenants());
      const searchResults = await runWithTimers(repository.searchTenants(''));

      expect(searchResults.length).toBe(allTenants.length);
    });

    it('should search by name', async () => {
      const tenants = await runWithTimers(repository.searchTenants('Pichincha'));

      expect(tenants.length).toBeGreaterThan(0);
      expect(tenants.some(t => t.name.includes('Pichincha'))).toBe(true);
    });

    it('should search by country', async () => {
      const tenants = await runWithTimers(repository.searchTenants('Ecuador'));

      expect(tenants.length).toBeGreaterThan(0);
      tenants.forEach(t => {
        expect(t.country).toBe('Ecuador');
      });
    });

    it('should be case-insensitive', async () => {
      const lowerCase = await runWithTimers(repository.searchTenants('ecuador'));
      const upperCase = await runWithTimers(repository.searchTenants('ECUADOR'));

      expect(lowerCase.length).toBe(upperCase.length);
    });

    it('should handle whitespace query', async () => {
      const allTenants = await runWithTimers(repository.getTenants());
      const searchResults = await runWithTimers(repository.searchTenants('   '));

      expect(searchResults.length).toBe(allTenants.length);
    });

    it('should return empty array for no matches', async () => {
      const tenants = await runWithTimers(repository.searchTenants('zzzznonexistent'));

      expect(tenants).toEqual([]);
    });

    it('should search partial names', async () => {
      const tenants = await runWithTimers(repository.searchTenants('banco'));

      expect(tenants.length).toBeGreaterThan(0);
    });
  });

  describe('tenant data integrity', () => {
    it('should have unique IDs', async () => {
      const tenants = await runWithTimers(repository.getTenants());
      const ids = tenants.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs', async () => {
      const tenants = await runWithTimers(repository.getTenants());
      const slugs = tenants.map(t => t.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should have valid branding colors', async () => {
      const tenants = await runWithTimers(repository.getTenants());

      tenants.forEach(tenant => {
        expect(tenant.branding.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have card features with valid types', async () => {
      const tenants = await runWithTimers(repository.getTenants());

      tenants.forEach(tenant => {
        if (tenant.features.cards.enabled) {
          expect(tenant.features.cards.allowedTypes.length).toBeGreaterThan(0);
          tenant.features.cards.allowedTypes.forEach(type => {
            expect(['credit', 'debit', 'virtual']).toContain(type);
          });
        }
      });
    });
  });
});
