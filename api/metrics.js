/**
 * Vercel Serverless Function — RevenueCat API Proxy
 *
 * This function proxies requests to the RevenueCat Charts API v2,
 * keeping the secret API key server-side in environment variables.
 *
 * Environment variables required (set in Vercel dashboard):
 *   REVENUECAT_API_KEY     — v2 secret key (sk_...)
 *   REVENUECAT_PROJECT_ID  — project ID (proj...)
 *
 * Endpoints proxied:
 *   GET /api/metrics?type=overview
 *   GET /api/metrics?type=chart&slug=mrr&resolution=month
 */

const RC_BASE = 'https://api.revenuecat.com/v2';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.REVENUECAT_API_KEY;
  const projectId = process.env.REVENUECAT_PROJECT_ID;

  if (!apiKey || !projectId) {
    return res.status(500).json({ error: 'Server configuration error: missing credentials' });
  }

  const { type, slug, resolution = 'month' } = req.query;

  let upstreamUrl;

  if (type === 'overview') {
    upstreamUrl = `${RC_BASE}/projects/${projectId}/metrics/overview`;
  } else if (type === 'chart' && slug) {
    upstreamUrl = `${RC_BASE}/projects/${projectId}/charts/${slug}?resolution=${resolution}`;
  } else {
    return res.status(400).json({ error: 'Invalid request. Use ?type=overview or ?type=chart&slug=<slug>' });
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const data = await upstream.json();

    // Pass through rate-limit headers so the client can respect them
    if (upstream.headers.get('x-ratelimit-remaining')) {
      res.setHeader('x-ratelimit-remaining', upstream.headers.get('x-ratelimit-remaining'));
    }
    if (upstream.headers.get('retry-after')) {
      res.setHeader('retry-after', upstream.headers.get('retry-after'));
    }

    // Cache chart data for 6 hours, overview for 1 hour
    const ttl = type === 'overview' ? 3600 : 21600;
    res.setHeader('Cache-Control', `public, s-maxage=${ttl}, stale-while-revalidate=60`);

    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error('RevenueCat proxy error:', err);
    return res.status(502).json({ error: 'Failed to reach RevenueCat API' });
  }
}
