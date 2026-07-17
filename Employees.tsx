import { useState, type FormEvent } from 'react'
import { useHR } from '../context/HRContext'
import { Modal } from '../components/Modal'
import type { Employee, EmployeeStatus } from '../types'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  position: '',
  salary: '',
  joinDate: new Date().toISOString().slice(0, 10),
  status: 'Active' as EmployeeStatus,
}

export function Employees() {
  const {
    employees,
    departments,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getDepartmentName,
  } = useHR()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    const name = `${e.firstName} ${e.lastName}`.toLowerCase()
    return (
      name.includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q)
    )
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, departmentId: departments[0]?.id ?? '' })
    setModalOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditing(emp)
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      departmentId: emp.departmentId,
      position: emp.position,
      salary: String(emp.salary),
      joinDate: emp.joinDate,
      status: emp.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const data = {
      ...form,
      salary: Number(form.salary),
    }
    if (editing) {
      updateEmployee(editing.id, data)
    } else {
      addEmployee(data)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete employee "${name}"?`)) {
      deleteEmployee(id)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Employees</h1>
          <p className="page-subtitle">Manage your workforce</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Add Employee
        </button>
      </header>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by name, email, or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <p className="empty-text">No employees found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <strong>
                        {emp.firstName} {emp.lastName}
                      </strong>
                    </td>
                    <td>{emp.email}</td>
                    <td>{getDepartmentName(emp.departmentId)}</td>
                    <td>{emp.position}</td>
                    <td>${emp.salary.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${emp.status.toLowerCase().replace(' ', '-')}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEdit(emp)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Employee' : 'Add Employee'}
        onClose={() => setModalOpen(false)}
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              First Name
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </label>
            <label>
              Last Name
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </label>
          </div>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label>
              Department
              <select
                required
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Position
              <input
                required
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Salary ($)
              <input
                type="number"
                required
                min={0}
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </label>
            <label>
              Join Date
              <input
                type="date"
                required
                value={form.joinDate}
                onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              />
            </label>
          </div>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
