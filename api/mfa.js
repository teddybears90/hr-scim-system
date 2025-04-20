const { createClient } = require('@supabase/supabase-js');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { method } = req;

  try {
    // Hämta användaren från Supabase-session-token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

    const userId = user.id;

    if (method === 'POST') {
      // Skapa ny MFA-secret
      const secret = speakeasy.generateSecret({
        name: `My HR App (${user.email})`,
        length: 20
      });

      // Spara till användarens rad i databasen
      const { error } = await supabase
        .from('users')
        .update({ mfa_secret: secret.base32 })
        .eq('email', user.email);

      if (error) throw error;

      // Generera QR-kod
      const otpauth_url = secret.otpauth_url;
      const qrImage = await qrcode.toDataURL(otpauth_url);

      return res.status(200).json({ qr: qrImage, secret: secret.base32 });
    }

    if (method === 'POST' && req.body.verify) {
      // Verifiera TOTP-kod
      const code = req.body.code;
      const { data, error } = await supabase
        .from('users')
        .select('mfa_secret')
        .eq('email', user.email)
        .single();

      if (error || !data.mfa_secret) return res.status(400).json({ error: 'MFA secret missing' });

      const verified = speakeasy.totp.verify({
        secret: data.mfa_secret,
        encoding: 'base32',
        token: code,
        window: 1
      });

      return res.status(200).json({ valid: verified });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
