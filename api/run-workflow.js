// api/run-workflow.js

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // 直接使用 API Key（测试用）
    const DIFY_API_KEY = process.env.DIFY_API_KEY || 'app-WeBjHKRI4RijiIv08WL3lCME';
    const DIFY_API_URL = 'https://api.dify.ai/v1/workflows/run';

    console.log('API Key configured:', DIFY_API_KEY ? 'Yes' : 'No');
    console.log('API Key value:', DIFY_API_KEY);

    if (!DIFY_API_KEY) {
        console.error('Error: API key not configured');
        return res.status(500).json({ success: false, message: 'API key not configured' });
    }

    try {
        // 读取请求体
        const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            });
            req.on('end', () => {
                try {
                    console.log('Request body received, length:', data.length);
                    console.log('Request body:', data);
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    console.error('JSON parse error:', error);
                    reject(new Error('Invalid JSON format: ' + error.message));
                }
            });
            req.on('error', (err) => {
                console.error('Request error:', err);
                reject(err);
            });
        });

        console.log('Parsed body:', body);
        console.log('Inputs:', body.inputs);

        // 发送请求到 Dify
        console.log('Sending request to Dify...');
        const response = await fetch(DIFY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: body.inputs,
                user: body.user || 'vercel-user'
            })
        });

        console.log('Dify API status:', response.status);
        console.log('Dify API status text:', response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Dify API error response:', errorData);
            return res.status(response.status).json({ 
                success: false, 
                message: errorData?.message || errorData?.detail || `Dify API error: ${response.status}` 
            });
        }

        const data = await response.json();
        console.log('Dify API response:', JSON.stringify(data, null, 2));
        
        // 确保返回的数据格式正确
        if (data.hasOwnProperty('success')) {
            res.status(200).json(data);
        } else {
            res.status(200).json({
                success: true,
                data: data
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
}