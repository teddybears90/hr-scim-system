<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Användaröversikt</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.5/dist/umd/supabase.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
    th { background-color: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Användare i databasen</h1>
  <table id="userTable">
    <thead>
      <tr>
        <th>Namn</th>
        <th>Email</th>
        <th>Avdelning</th>
        <th>Titel</th>
        <th>Employee ID</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <script>
    const supabase = supabase.createClient(
      'https://pwxslkkxevuknredmfpb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3eHNsa2t4ZXZ1a25yZWRtZnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDA1MDcsImV4cCI6MjA2MDU3NjUwN30.vWwGu6q8mJy5vX1g584qSL73V9F3bhh2RSW-2dNeEc0'
    );

    async function loadUsers() {
      const { data, error } = await supabase.from('users').select('*');
      console.log("Supabase response:", { data, error });

      if (error) {
        alert('Fel vid hämtning: ' + error.message);
        return;
      }

      if (!Array.isArray(data)) {
        alert('Ingen data hittades (eller felaktigt format)');
        return;
      }

      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = '';

      data.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.first_name || ''} ${user.last_name || ''}</td>
          <td>${user.email || ''}</td>
          <td>${user.department || ''}</td>
          <td>${user.title || ''}</td>
          <td>${user.employee_number || ''}</td>
        `;
        tbody.appendChild(row);
      });
    }

    loadUsers();
  </script>
</body>
</html>
