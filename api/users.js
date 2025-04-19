import { createClient } from '@supabase/supabase-js';

// Initiera Supabase-klienten
const supabase = createClient(
  process.env.https://pwxslkkxevuknredmfpb.supabase.co,
  process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3eHNsa2t4ZXZ1a25yZWRtZnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAwMDUwNywiZXhwIjoyMDYwNTc2NTA3fQ.m7QLOS47FT_jHdWHLwW7mBJ31h3dXK-KpmX5G0jJ5Qo
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data: users, error } = await supabase.from('users').select('*');

        if (error) {
          console.error('Supabase SELECT error:', error.message);
          throw new Error('Kunde inte hämta användare från databasen');
        }

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

      case 'POST': {
        const user = req.body;
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
        } = user;

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

        if (error) {
          console.error('Supabase INSERT error:', error.message);
          throw new Error('Kunde inte skapa användare i databasen');
        }

        return res.status(201).json(user);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error('SCIM handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
