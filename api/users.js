module.exports = async function handler(req, res) {
  const { method, query } = req;

  if (method === 'GET') {
    if (query.id) {
      return res.status(200).json({
        id: "1",
        name: { givenName: "Alice", familyName: "Johnson" },
        emails: [{ value: "alice@example.com" }],
        employeeNumber: "EMP001",
        department: "IT",
        title: "Developer",
        startDate: "2023-01-01",
        endDate: null,
        manager_name: "Bob Smith",
        manager_id: "EMP002"
      });
    }

    return res.status(200).json({
      Resources: [
        {
          id: "1",
          name: { givenName: "Alice", familyName: "Johnson" },
          emails: [{ value: "alice@example.com" }],
          employeeNumber: "EMP001",
          department: "IT",
          title: "Developer",
          startDate: "2023-01-01",
          endDate: null,
          manager_name: "Bob Smith",
          manager_id: "EMP002"
        },
        {
          id: "2",
          name: { givenName: "Bob", familyName: "Smith" },
          emails: [{ value: "bob@example.com" }],
          employeeNumber: "EMP002",
          department: "HR",
          title: "Manager",
          startDate: "2022-05-15",
          endDate: null,
          manager_name: "",
          manager_id: ""
        }
      ]
    });
  }

  return res.status(405).json({ error: 'Method not allowed in test mode' });
};
