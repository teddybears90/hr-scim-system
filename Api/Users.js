// api/users.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET': {
      const { data: users, error } = await supabase.from('users').select('*')
      if (error) return res.status(500).json({ error: error.message })

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
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"]
      }))

      return res.status(200).json({
        Resources: scimUsers,
        totalResults: scimUsers.length
      })
    }

    case 'POST': {
      const user = req.body
      const { userName, name, emails, phoneNumbers, title, department, employeeNumber, startDate, endDate } = user

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
      })

      if (error) return res.status(500).json({ error: error.message })

      return res.status(201).json(user)
    }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
