const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

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

function getPreviousWeekRange(now = new Date()) {
  const nowInKst = new Date(now.getTime() + KST_OFFSET_MS);
  const daysSinceMonday = (nowInKst.getUTCDay() + 6) % 7;
  const thisMonday = Date.UTC(
    nowInKst.getUTCFullYear(),
    nowInKst.getUTCMonth(),
    nowInKst.getUTCDate() - daysSinceMonday
  );
  const formatDate = (timestamp) => new Date(timestamp).toISOString().slice(0, 10);

  return {
    startDate: formatDate(thisMonday - 7 * DAY_MS),
    endDate: formatDate(thisMonday - DAY_MS),
  };
}

async function main() {
  const { BetaAnalyticsDataClient } = require('@google-analytics/data');
  const propertyId = getRequiredEnv('GA4_PROPERTY_ID');
  const credentials = parseCredentials(getRequiredEnv('GA4_SERVICE_ACCOUNT_JSON'));
  const discordWebhookUrl = getRequiredEnv('DISCORD_WEBHOOK_URL');
  const siteUrl = process.env.SITE_URL?.trim();
  const customStartDate = process.env.REPORT_START_DATE?.trim();
  const customEndDate = process.env.REPORT_END_DATE?.trim();

  if (!/^\d+$/.test(propertyId)) {
    throw new Error('GA4_PROPERTY_ID must contain only numbers');
  }

  if (Boolean(customStartDate) !== Boolean(customEndDate)) {
    throw new Error('REPORT_START_DATE and REPORT_END_DATE must be used together');
  }

  if (
    (customStartDate && !DATE_PATTERN.test(customStartDate)) ||
    (customEndDate && !DATE_PATTERN.test(customEndDate))
  ) {
    throw new Error('Report dates must use YYYY-MM-DD format');
  }

  const { startDate, endDate } = customStartDate
    ? { startDate: customStartDate, endDate: customEndDate }
    : getPreviousWeekRange();
  const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
  const [report] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
  });

  const row = report.rows?.[0];
  const pageViews = parseCount(row?.metricValues?.[0]?.value);
  const activeUsers = parseCount(row?.metricValues?.[1]?.value);
  const timeZone = report.metadata?.timeZone || 'GA4 속성 시간대';

  const response = await fetch(discordWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      embeds: [
        {
          title: '📊 GA4 블로그 주간 통계',
          description: `${startDate} 00:00 ~ ${endDate} 23:59의 GA4 방문 통계입니다.`,
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
    `Sent GA4 weekly stats: period=${startDate}..${endDate}, pageViews=${pageViews}, activeUsers=${activeUsers}`
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Failed to send GA4 weekly stats: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { getPreviousWeekRange };
