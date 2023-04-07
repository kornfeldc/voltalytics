import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = createProxyMiddleware({
    target: 'https://api.solarmanpv.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api/proxy': '',
    },
    onError(err, req, res) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    },
    onProxyReq(proxyReq, req, res) {
        console.log('Proxy request:', req.url);
    },
    onProxyRes(proxyRes, req, res) {
        console.log('Proxy response:', proxyRes.statusCode);
    },
});

export default (req, res) => {
    proxy(req, res, (result) => {
        if (result instanceof Error) {
            res.status(500).json({ error: result.message });
        }
    });
};

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};
