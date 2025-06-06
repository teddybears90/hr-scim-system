const { createClient } = require('@supabase/supabase-js'); const speakeasy = require('speakeasy');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ error: 'Unauthorized' });

const { method } = req;

try { const { data: { user }, error: userError } = await supabase.auth.getUser(token); if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

if (method === 'POST' && !req.body.verify) {
  const secret = speakeasy.generateSecret({
    name: `My HR App (${user.email})`,
    length: 20
  });

  const { error } = await supabase
    .from('users')
    .update({ mfa_secret: secret.base32 })
    .eq('id', user.id);

  if (error) throw error;

  const otpauthUrl = secret.otpauth_url;
  const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

  return res.status(200).json({ qr: qrLink, secret: secret.base32 });
}

if (method === 'POST' && req.body.verify) {
  const code = req.body.code;
  const { data, error } = await supabase
    .from('users')
    .select('mfa_secret')
    .eq('id', user.id)
    .single();

  if (error || !data.mfa_secret) return res.status(400).json({ error: 'MFA secret missing' });

  const verified = speakeasy.totp.verify({
    secret: data.mfa_secret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (verified) {
    await supabase
      .from('users')
      .update({ mfa_enabled: true })
      .eq('id', user.id);
  }

  return res.status(200).json({ valid: verified });
}

return res.status(405).json({ error: 'Method not allowed' });

} catch (err) { console.error('MFA API error:', err); return res.status(500).json({ error: err.message }); } };

