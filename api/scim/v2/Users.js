// File: /api/scim/v2/Users.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query, body } = req;
  const userId = query.id || (body && body.id);

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.SCIM_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;

      const scimUsers = data.map((user) => ({
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        id: user.id,
        userName: user.email,
        name: {
          givenName: user.first_name,
          familyName: user.last_name
        },
        emails: [{ value: user.email, primary: true }],
        externalId: user.employee_number,
        meta: {
          resourceType: "User",
          location: `${req.headers.host}/api/scim/v2/users/${user.id}`
        }
      }));

      return res.status(200).json({
        totalResults: scimUsers.length,
        itemsPerPage: scimUsers.length,
        startIndex: 1,
        Resources: scimUsers,
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"]
      });
    }

    if (method === 'POST') {
      const user = body;
      const { givenName, familyName } = user.name || {};
      const email = user.userName;
      const employee_number = user.externalId;

      const { data, error } = await supabase.from('users').insert([
        {
          first_name: givenName,
          last_name: familyName,
          email,
          employee_number,
        }
      ]);

      if (error) throw error;

      return res.status(201).json({ id: data[0].id });
    }

    if (method === 'PATCH') {
      const operations = body.Operations || [];
      const updates = {};

      operations.forEach(op => {
        const path = op.path?.toLowerCase();
        const value = op.value;
        if (path === 'name.givenname') updates.first_name = value;
        if (path === 'name.familyname') updates.last_name = value;
        if (path === 'username' || path === 'emails') updates.email = value;
        if (path === 'externalid') updates.employee_number = value;
      });

      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;

      return res.status(200).json({ status: 'Updated' });
    }

    if (method === 'DELETE') {
      if (!userId) return res.status(400).json({ error: 'Missing user ID' });
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
