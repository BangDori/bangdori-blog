const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function parseCredentials(rawCredentials) {
  try {
    return JSON.parse(rawCredentials);
  } catch {
    throw new Error('GA4_SERVICE_ACCOUNT_JSON must be valid JSON');
  }
}

function parseCount(value) {
  const count = Number.parseInt(value || '0', 10);
  return Number.isNaN(count) ? 0 : count;
}

function formatGaDate(value, fallback) {
  if (!/^\d{8}$/.test(value || '')) {
    return fallback === 'yesterday' ? '어제' : fallback;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

async function main() {
  const propertyId = getRequiredEnv('GA4_PROPERTY_ID');
  const credentials = parseCredentials(getRequiredEnv('GA4_SERVICE_ACCOUNT_JSON'));
  const discordWebhookUrl = getRequiredEnv('DISCORD_WEBHOOK_URL');
  const siteUrl = process.env.SITE_URL?.trim();
  const reportDate = process.env.REPORT_DATE?.trim() || 'yesterday';

  if (!/^\d+$/.test(propertyId)) {
    throw new Error('GA4_PROPERTY_ID must contain only numbers');
  }

  if (reportDate !== 'yesterday' && !DATE_PATTERN.test(reportDate)) {
    throw new Error('REPORT_DATE must use YYYY-MM-DD format');
  }

  const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
  const [report] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: reportDate, endDate: reportDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
  });

  const row = report.rows?.[0];
  const pageViews = parseCount(row?.metricValues?.[0]?.value);
  const activeUsers = parseCount(row?.metricValues?.[1]?.value);
  const displayDate = formatGaDate(row?.dimensionValues?.[0]?.value, reportDate);
  const timeZone = report.metadata?.timeZone || 'GA4 속성 시간대';

  const response = await fetch(discordWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      embeds: [
        {
          title: '📊 GA4 블로그 일간 통계',
          description: `${displayDate}의 GA4 방문 통계입니다.`,
          ...(siteUrl ? { url: siteUrl.replace(/\/$/, '') } : {}),
          color: 5763719,
          fields: [
            {
              name: '조회수',
              value: `${pageViews.toLocaleString('ko-KR')}회`,
              inline: true,
            },
            {
              name: '활성 사용자',
              value: `${activeUsers.toLocaleString('ko-KR')}명`,
              inline: true,
            },
            {
              name: '기준 시간대',
              value: timeZone,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook responded with ${response.status}`);
  }

  console.log(
    `Sent GA4 daily stats: date=${displayDate}, pageViews=${pageViews}, activeUsers=${activeUsers}`
  );
}

main().catch((error) => {
  console.error(`Failed to send GA4 daily stats: ${error.message}`);
  process.exitCode = 1;
});
