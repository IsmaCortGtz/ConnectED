<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #1a1a1a;
            color: #e0e0e0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
        }

        .header h1 {
            color: #3b82f6;
            font-size: 28px;
            margin-bottom: 8px;
        }

        .header p {
            color: #9ca3af;
            font-size: 14px;
        }

        .table-wrapper {
            width: 100%;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: #262626;
            border-radius: 8px;
        }

        thead {
            background-color: #3b82f6;
        }

        thead th {
            color: #ffffff;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-family: Arial, Helvetica, sans-serif;
        }

        thead th:first-child {
            border-top-left-radius: 8px;
        }

        thead th:last-child {
            border-top-right-radius: 8px;
        }

        tbody tr:nth-child(odd) td {
            background-color: #2a2a2a;
        }

        tbody tr:nth-child(even) td {
            background-color: #262626;
        }

        tbody td {
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top: none;
            color: #e0e0e0;
            font-size: 13px;
        }

        tbody tr:last-child td:first-child {
            border-bottom-left-radius: 8px;
        }

        tbody tr:last-child td:last-child {
            border-bottom-right-radius: 8px;
        }

        .id-column {
            width: 60px;
            text-align: center;
            font-weight: bold;
            color: #60a5fa;
        }

        .role-column {
            text-transform: capitalize;
            color: #a78bfa;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            padding-top: 15px;
            border-top: 1px solid #374151;
        }

        .no-data {
            text-align: center;
            padding: 40px 20px;
            color: #9ca3af;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Users Report</h1>
        <p>Generated on {{ date('F d, Y - h:i A') }}</p>
    </div>

    <div class="table-wrapper">
        @if(count($users) > 0)
            <table>
                <thead>
                    <tr>
                        <th class="id-column">#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($users as $user)
                        <tr>
                            <td class="id-column">{{ $user->id }}</td>
                            <td>{{ $user->name }} {{ $user->last_name }}</td>
                            <td>{{ $user->email }}</td>
                            <td class="role-column">{{ $user->role }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                No users available
            </div>
        @endif
    </div>

    <div class="footer">
        <p>ConnectED Platform - Users Report</p>
        <p>Total Users: {{ count($users) }}</p>
    </div>
</body>
</html>
