import { useState, type FormEvent } from 'react'
import { useHR } from '../context/HRContext'
import { Modal } from '../components/Modal'

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity/Paternity', 'Unpaid Leave']

const emptyForm = {
  employeeId: '',
  type: leaveTypes[0],
  startDate: '',
  endDate: '',
  reason: '',
}

export function LeaveRequests() {
  const {
    leaveRequests,
    employees,
    addLeaveRequest,
    updateLeaveStatus,
    deleteLeaveRequest,
    getEmployeeName,
  } = useHR()

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')

  const filtered =
    filter === 'All' ? leaveRequests : leaveRequests.filter((l) => l.status === filter)

  const openAdd = () => {
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? '' })
    setModalOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    addLeaveRequest(form)
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this leave request?')) {
      deleteLeaveRequest(id)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Leave Requests</h1>
          <p className="page-subtitle">Track and manage employee time off</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd} disabled={employees.length === 0}>
          + New Request
        </button>
      </header>

      <div className="toolbar">
        <div className="filter-tabs">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
              {tab !== 'All' && (
                <span className="filter-count">
                  {leaveRequests.filter((l) => l.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <p className="empty-text">No leave requests found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <strong>{getEmployeeName(req.employeeId)}</strong>
                    </td>
                    <td>{req.type}</td>
                    <td>{req.startDate}</td>
                    <td>{req.endDate}</td>
                    <td className="reason-cell">{req.reason}</td>
                    <td>
                      <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {req.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => updateLeaveStatus(req.id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => updateLeaveStatus(req.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleDelete(req.id)}
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

      <Modal open={modalOpen} title="New Leave Request" onClose={() => setModalOpen(false)}>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Employee
            <select
              required
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Leave Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {leaveTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Start Date
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </label>
          </div>
          <label>
            Reason
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Brief reason for leave"
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
