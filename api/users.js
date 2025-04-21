const { createClient } = require('@supabase/supabase-js');

const supabase = createClient( process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY );

module.exports = async function handler(req, res) { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ error: 'Unauthorized' });

const { method, query, body } = req;

try { const { data: session, error: sessionError } = await supabase.auth.getUser(token); if (sessionError || !session.user) return res.status(401).json({ error: 'Invalid token' });

if (method === 'GET') {
  if (query.id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', query.id).single();
    if (error) throw error;
    return res.status(200).json(data);
  }
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return res.status(200).json({ Resources: data });
}

if (method === 'POST') {
  const { name, emails, department, title, employeeNumber, startDate, endDate, phoneNumbers, manager_id, manager_name, userName } = body;
  const insert = {
    name,
    emails,
    department,
    title,
    employeeNumber,
    startDate,
    endDate,
    phoneNumbers,
    manager_id,
    manager_name,
    userName
  };
  const { data, error } = await supabase.from('users').insert(insert).select().single();
  if (error) throw error;
  return res.status(201).json(data);
}

if (method === 'PATCH') {
  const { id } = query;
  const { name, emails, department, title, employeeNumber, startDate, endDate, phoneNumbers, manager_id, manager_name } = body;
  const update = {
    name,
    emails,
    department,
    title,
    employeeNumber,
    startDate,
    endDate,
    phoneNumbers,
    manager_id,
    manager_name
  };
  const { data, error } = await supabase.from('users').update(update).eq('id', id).select().single();
  if (error) throw error;
  return res.status(200).json(data);
}

if (method === 'DELETE') {
  const { id } = query;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return res.status(204).end();
}

return res.status(405).json({ error: 'Method not allowed' });

} catch (err) { console.error(err); return res.status(500).json({ error: err.message }); } };

