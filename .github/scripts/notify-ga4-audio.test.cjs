const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

for (const period of ['daily', 'weekly']) {
  test(`${period} notification counts audio starts without sending a webhook`, async () => {
    const reports = [];
    let sent;
    const delivered = new Promise((resolve) => {
      sent = resolve;
    });
    const module = { exports: {} };
    const mockRequire = (name) => {
      assert.equal(name, '@google-analytics/data');
      return {
        BetaAnalyticsDataClient: class {
          async runReport(query) {
            reports.push(query);
            if (query.dimensionFilter?.filter?.stringFilter?.value === 'audio_start') {
              return [{ rows: [{ metricValues: [{ value: '7' }] }] }];
            }
            if (query.dimensionFilter) return [{ rows: [] }];
            return [
              {
                rows: [
                  {
                    dimensionValues: [{ value: '20260923' }],
                    metricValues: [{ value: '12' }, { value: '3' }],
                  },
                ],
              },
            ];
          }
        },
      };
    };
    mockRequire.main = module;

    vm.runInNewContext(
      fs.readFileSync(path.join(__dirname, `notify-ga4-${period}.cjs`), 'utf8'),
      {
        require: mockRequire,
        module,
        process: {
          env: {
            GA4_PROPERTY_ID: '123',
            GA4_SERVICE_ACCOUNT_JSON: '{}',
            DISCORD_WEBHOOK_URL: 'https://example.invalid/webhook',
            ...(period === 'daily'
              ? { REPORT_DATE: '2026-09-23' }
              : { REPORT_START_DATE: '2026-09-21', REPORT_END_DATE: '2026-09-23' }),
          },
        },
        fetch: async (_url, options) => {
          sent(JSON.parse(options.body));
          return { ok: true };
        },
        console: {
          log() {},
          error(error) {
            throw new Error(error);
          },
        },
        Date,
      },
      { filename: `notify-ga4-${period}.cjs` }
    );

    const payload = await delivered;
    assert.equal(reports.length, 3);
    assert.equal(reports[2].metrics[0].name, 'eventCount');
    assert.equal(reports[2].dimensionFilter.filter.fieldName, 'eventName');
    const audioField = payload.embeds[0].fields.find((field) => field.name === '음성 첫 재생');
    assert.equal(audioField.value, '7회');
  });
}
