import { useHR } from '../context/HRContext'

export function Dashboard() {
  const { employees, departments, leaveRequests } = useHR()

  const activeEmployees = employees.filter((e) => e.status === 'Active').length
  const onLeave = employees.filter((e) => e.status === 'On Leave').length
  const pendingLeave = leaveRequests.filter((l) => l.status === 'Pending').length
  const avgSalary =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length)
      : 0

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: '👥', color: 'blue' },
    { label: 'Active', value: activeEmployees, icon: '✅', color: 'green' },
    { label: 'On Leave', value: onLeave, icon: '🏖️', color: 'amber' },
    { label: 'Departments', value: departments.length, icon: '🏢', color: 'purple' },
    { label: 'Pending Leave', value: pendingLeave, icon: '⏳', color: 'orange' },
    { label: 'Avg. Salary', value: `$${avgSalary.toLocaleString()}`, icon: '💰', color: 'teal' },
  ]

  const recentEmployees = [...employees]
    .sort((a, b) => b.joinDate.localeCompare(a.joinDate))
    .slice(0, 5)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your organization</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card stat-${stat.color}`}>
            <span className="stat-icon">{stat.icon}</span>
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Recent Employees</h2>
          {recentEmployees.length === 0 ? (
            <p className="empty-text">No employees yet.</p>
          ) : (
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <strong>
                        {emp.firstName} {emp.lastName}
                      </strong>
                    </td>
                    <td>{emp.position}</td>
                    <td>
                      <span className={`badge badge-${emp.status.toLowerCase().replace(' ', '-')}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{emp.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h2>Department Headcount</h2>
          {departments.length === 0 ? (
            <p className="empty-text">No departments yet.</p>
          ) : (
            <ul className="dept-list">
              {departments.map((dept) => {
                const count = employees.filter((e) => e.departmentId === dept.id).length
                const pct = employees.length ? Math.round((count / employees.length) * 100) : 0
                return (
                  <li key={dept.id} className="dept-item">
                    <div className="dept-item-header">
                      <span>{dept.name}</span>
                      <span className="dept-count">{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
