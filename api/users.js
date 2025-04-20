const { createClient } = require('@supabase/supabase-js');

const supabase = createClient( process.env.SUPABASE_URL, process.env.SUPABASE_KEY );

module.exports = async function handler(req, res) { const { method, query, body } = req;

// Tillfällig tokenbypass (för att tillåta Supabase-session-token) const authHeader = req.headers.authorization; const token = authHeader?.replace('Bearer ', ''); if (!token) { return res.status(401).json({ error: 'No token provided' }); }

try { if (method === 'GET') { const { id } = query; if (id) { const { data: user, error } = await supabase .from('users') .select('*') .eq('id', id) .single();

if (error) throw error;

    return res.status(200).json({
      id: user.id,
      userName: user.username,
      name: {
        givenName: user.first_name,
        familyName: user.last_name
      },
      emails: [{ value: user.email }],
      phoneNumbers: user.phone ? [{ value: user.phone }] : [],
      title: user.title,
      department: user.department,
      employeeNumber: user.employee_number,
      startDate: user.start_date,
      endDate: user.end_date,
      active: user.active,
      meta: {
        created: user.created_at,
        resourceType: 'User'
      },
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User']
    });
  } else {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;

    const scimUsers = users.map(user => ({
      id: user.id,
      userName: user.username,
      name: {
        givenName: user.first_name,
        familyName: user.last_name
      },
      emails: [{ value: user.email }],
      phoneNumbers: user.phone ? [{ value: user.phone }] : [],
      title: user.title,
      department: user.department,
      employeeNumber: user.employee_number,
      startDate: user.start_date,
      endDate: user.end_date,
      active: user.active,
      meta: {
        created: user.created_at,
        resourceType: 'User'
      },
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User']
    }));

    return res.status(200).json({
      Resources: scimUsers,
      totalResults: scimUsers.length
    });
  }
}

if (method === 'POST') {
  const {
    userName,
    name,
    emails,
    phoneNumbers,
    title,
    department,
    employeeNumber,
    startDate,
    endDate
  } = body;

  const { error } = await supabase.from('users').insert({
    username: userName,
    first_name: name?.givenName,
    last_name: name?.familyName,
    email: emails?.[0]?.value,
    phone: phoneNumbers?.[0]?.value,
    title,
    department,
    employee_number: employeeNumber,
    start_date: startDate,
    end_date: endDate,
    active: true
  });

  if (error) throw error;

  return res.status(201).json(body);
}

if (method === 'PATCH') {
  const { id } = query;
  if (!id) return res.status(400).json({ error: 'Missing user id' });

  const updateFields = {};
  if (body.name?.givenName) updateFields.first_name = body.name.givenName;
  if (body.name?.familyName) updateFields.last_name = body.name.familyName;
  if (body.emails?.[0]?.value) updateFields.email = body.emails[0].value;
  if (body.phoneNumbers?.[0]?.value) updateFields.phone = body.phoneNumbers[0].value;
  if (body.department) updateFields.department = body.department;
  if (body.title) updateFields.title = body.title;
  if (body.employeeNumber) updateFields.employee_number = body.employeeNumber;
  if (body.startDate) updateFields.start_date = body.startDate;
  if (body.endDate) updateFields.end_date = body.endDate;
  if (typeof body.active === 'boolean') updateFields.active = body.active;

  const { error } = await supabase
    .from('users')
    .update(updateFields)
    .eq('id', id);

  if (error) throw error;

  return res.status(200).json({ message: 'User updated' });
}

if (method === 'DELETE') {
  const { id } = query;
  if (!id) return res.status(400).json({ error: 'Missing user id' });

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return res.status(204).end();
}

res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
return res.status(405).end(`Method ${method} Not Allowed`);

} catch (err) { console.error('SCIM API error:', err.message); return res.status(500).json({ error: err.message }); } };

