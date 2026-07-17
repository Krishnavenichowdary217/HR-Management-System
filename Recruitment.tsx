import { useState, type FormEvent } from 'react'
import { useHR } from '../context/HRContext'
import { Modal } from '../components/Modal'
import type { Applicant, ApplicantStatus, JobOpening, JobStatus, JobType } from '../types'

type Tab = 'jobs' | 'applicants'

const jobTypes: JobType[] = ['Full-time', 'Part-time', 'Contract']
const jobStatuses: JobStatus[] = ['Open', 'Closed', 'On Hold']
const applicantStatuses: ApplicantStatus[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
]

const emptyJobForm = {
  title: '',
  departmentId: '',
  description: '',
  location: '',
  type: 'Full-time' as JobType,
  salaryMin: '',
  salaryMax: '',
  status: 'Open' as JobStatus,
  postedDate: new Date().toISOString().slice(0, 10),
}

const emptyApplicantForm = {
  jobId: '',
  name: '',
  email: '',
  phone: '',
  appliedDate: new Date().toISOString().slice(0, 10),
  status: 'Applied' as ApplicantStatus,
  notes: '',
}

export function Recruitment() {
  const {
    jobOpenings,
    applicants,
    departments,
    addJobOpening,
    updateJobOpening,
    deleteJobOpening,
    addApplicant,
    updateApplicant,
    updateApplicantStatus,
    deleteApplicant,
    getDepartmentName,
    getJobTitle,
  } = useHR()

  const [tab, setTab] = useState<Tab>('jobs')
  const [jobModalOpen, setJobModalOpen] = useState(false)
  const [applicantModalOpen, setApplicantModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null)
  const [jobForm, setJobForm] = useState(emptyJobForm)
  const [applicantForm, setApplicantForm] = useState(emptyApplicantForm)
  const [jobFilter, setJobFilter] = useState<'All' | JobStatus>('All')
  const [applicantFilter, setApplicantFilter] = useState<'All' | ApplicantStatus>('All')

  const openJobs = jobOpenings.filter((j) => j.status === 'Open').length
  const totalApplicants = applicants.length
  const inPipeline = applicants.filter(
    (a) => !['Hired', 'Rejected'].includes(a.status),
  ).length

  const filteredJobs =
    jobFilter === 'All' ? jobOpenings : jobOpenings.filter((j) => j.status === jobFilter)

  const filteredApplicants =
    applicantFilter === 'All'
      ? applicants
      : applicants.filter((a) => a.status === applicantFilter)

  const openAddJob = () => {
    setEditingJob(null)
    setJobForm({ ...emptyJobForm, departmentId: departments[0]?.id ?? '' })
    setJobModalOpen(true)
  }

  const openEditJob = (job: JobOpening) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      departmentId: job.departmentId,
      description: job.description,
      location: job.location,
      type: job.type,
      salaryMin: String(job.salaryMin),
      salaryMax: String(job.salaryMax),
      status: job.status,
      postedDate: job.postedDate,
    })
    setJobModalOpen(true)
  }

  const openAddApplicant = () => {
    setEditingApplicant(null)
    setApplicantForm({ ...emptyApplicantForm, jobId: jobOpenings[0]?.id ?? '' })
    setApplicantModalOpen(true)
  }

  const openEditApplicant = (applicant: Applicant) => {
    setEditingApplicant(applicant)
    setApplicantForm({
      jobId: applicant.jobId,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      appliedDate: applicant.appliedDate,
      status: applicant.status,
      notes: applicant.notes,
    })
    setApplicantModalOpen(true)
  }

  const handleJobSubmit = (e: FormEvent) => {
    e.preventDefault()
    const data = {
      ...jobForm,
      salaryMin: Number(jobForm.salaryMin),
      salaryMax: Number(jobForm.salaryMax),
    }
    if (editingJob) {
      updateJobOpening(editingJob.id, data)
    } else {
      addJobOpening(data)
    }
    setJobModalOpen(false)
  }

  const handleApplicantSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (editingApplicant) {
      updateApplicant(editingApplicant.id, applicantForm)
    } else {
      addApplicant(applicantForm)
    }
    setApplicantModalOpen(false)
  }

  const handleDeleteJob = (id: string, title: string) => {
    const count = applicants.filter((a) => a.jobId === id).length
    if (count > 0) {
      alert(`Cannot delete "${title}" — ${count} applicant(s) are linked to this job.`)
      return
    }
    if (window.confirm(`Delete job opening "${title}"?`)) {
      deleteJobOpening(id)
    }
  }

  const handleDeleteApplicant = (id: string, name: string) => {
    if (window.confirm(`Delete applicant "${name}"?`)) {
      deleteApplicant(id)
    }
  }

  const salaryLabel = (job: JobOpening) => {
    if (job.type === 'Part-time') {
      return `$${job.salaryMin}–$${job.salaryMax}/hr`
    }
    return `$${job.salaryMin.toLocaleString()}–$${job.salaryMax.toLocaleString()}`
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Recruitment</h1>
          <p className="page-subtitle">Manage job openings and applicants</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={tab === 'jobs' ? openAddJob : openAddApplicant}
        >
          {tab === 'jobs' ? '+ Post Job' : '+ Add Applicant'}
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <span className="stat-icon">📋</span>
          <div>
            <p className="stat-label">Open Positions</p>
            <p className="stat-value">{openJobs}</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-icon">👤</span>
          <div>
            <p className="stat-label">Total Applicants</p>
            <p className="stat-value">{totalApplicants}</p>
          </div>
        </div>
        <div className="stat-card stat-amber">
          <span className="stat-icon">🔄</span>
          <div>
            <p className="stat-label">In Pipeline</p>
            <p className="stat-value">{inPipeline}</p>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab ${tab === 'jobs' ? 'active' : ''}`}
            onClick={() => setTab('jobs')}
          >
            Job Openings
            <span className="filter-count">{jobOpenings.length}</span>
          </button>
          <button
            type="button"
            className={`filter-tab ${tab === 'applicants' ? 'active' : ''}`}
            onClick={() => setTab('applicants')}
          >
            Applicants
            <span className="filter-count">{applicants.length}</span>
          </button>
        </div>
      </div>

      {tab === 'jobs' && (
        <>
          <div className="toolbar">
            <div className="filter-tabs">
              {(['All', ...jobStatuses] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`filter-tab ${jobFilter === status ? 'active' : ''}`}
                  onClick={() => setJobFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="job-grid">
            {filteredJobs.length === 0 ? (
              <p className="empty-text">No job openings found.</p>
            ) : (
              filteredJobs.map((job) => {
                const applicantCount = applicants.filter((a) => a.jobId === job.id).length
                return (
                  <div key={job.id} className="job-card">
                    <div className="job-card-top">
                      <span className={`badge badge-job-${job.status.toLowerCase().replace(' ', '-')}`}>
                        {job.status}
                      </span>
                      <span className="job-type">{job.type}</span>
                    </div>
                    <h3>{job.title}</h3>
                    <p className="job-dept">{getDepartmentName(job.departmentId)}</p>
                    <p className="job-desc">{job.description}</p>
                    <div className="job-meta">
                      <span>📍 {job.location}</span>
                      <span>💰 {salaryLabel(job)}</span>
                    </div>
                    <p className="job-applicants">
                      {applicantCount} applicant{applicantCount !== 1 ? 's' : ''} · Posted{' '}
                      {job.postedDate}
                    </p>
                    <div className="dept-card-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => openEditJob(job)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {tab === 'applicants' && (
        <>
          <div className="toolbar">
            <div className="filter-tabs">
              {(['All', ...applicantStatuses] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`filter-tab ${applicantFilter === status ? 'active' : ''}`}
                  onClick={() => setApplicantFilter(status)}
                >
                  {status}
                  {status !== 'All' && (
                    <span className="filter-count">
                      {applicants.filter((a) => a.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            {filteredApplicants.length === 0 ? (
              <p className="empty-text">No applicants found.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Job</th>
                      <th>Email</th>
                      <th>Applied</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((applicant) => (
                      <tr key={applicant.id}>
                        <td>
                          <strong>{applicant.name}</strong>
                          {applicant.notes && (
                            <p className="table-subtext">{applicant.notes}</p>
                          )}
                        </td>
                        <td>{getJobTitle(applicant.jobId)}</td>
                        <td>{applicant.email}</td>
                        <td>{applicant.appliedDate}</td>
                        <td>
                          <span
                            className={`badge badge-applicant-${applicant.status.toLowerCase()}`}
                          >
                            {applicant.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            {applicant.status === 'Applied' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => updateApplicantStatus(applicant.id, 'Screening')}
                              >
                                Screen
                              </button>
                            )}
                            {applicant.status === 'Screening' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => updateApplicantStatus(applicant.id, 'Interview')}
                              >
                                Interview
                              </button>
                            )}
                            {applicant.status === 'Interview' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  onClick={() => updateApplicantStatus(applicant.id, 'Offer')}
                                >
                                  Offer
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => updateApplicantStatus(applicant.id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {applicant.status === 'Offer' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => updateApplicantStatus(applicant.id, 'Hired')}
                              >
                                Hire
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => openEditApplicant(applicant)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteApplicant(applicant.id, applicant.name)}
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
        </>
      )}

      <Modal
        open={jobModalOpen}
        title={editingJob ? 'Edit Job Opening' : 'Post New Job'}
        onClose={() => setJobModalOpen(false)}
      >
        <form className="form" onSubmit={handleJobSubmit}>
          <label>
            Job Title
            <input
              required
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              placeholder="e.g. Software Engineer"
            />
          </label>
          <div className="form-row">
            <label>
              Department
              <select
                required
                value={jobForm.departmentId}
                onChange={(e) => setJobForm({ ...jobForm, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={jobForm.type}
                onChange={(e) => setJobForm({ ...jobForm, type: e.target.value as JobType })}
              >
                {jobTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              required
              rows={3}
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            />
          </label>
          <label>
            Location
            <input
              required
              value={jobForm.location}
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
              placeholder="e.g. Remote, New York NY"
            />
          </label>
          <div className="form-row">
            <label>
              Salary Min ($)
              <input
                type="number"
                required
                min={0}
                value={jobForm.salaryMin}
                onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
              />
            </label>
            <label>
              Salary Max ($)
              <input
                type="number"
                required
                min={0}
                value={jobForm.salaryMax}
                onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Status
              <select
                value={jobForm.status}
                onChange={(e) => setJobForm({ ...jobForm, status: e.target.value as JobStatus })}
              >
                {jobStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Posted Date
              <input
                type="date"
                required
                value={jobForm.postedDate}
                onChange={(e) => setJobForm({ ...jobForm, postedDate: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setJobModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingJob ? 'Save Changes' : 'Post Job'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={applicantModalOpen}
        title={editingApplicant ? 'Edit Applicant' : 'Add Applicant'}
        onClose={() => setApplicantModalOpen(false)}
      >
        <form className="form" onSubmit={handleApplicantSubmit}>
          <label>
            Job Opening
            <select
              required
              value={applicantForm.jobId}
              onChange={(e) => setApplicantForm({ ...applicantForm, jobId: e.target.value })}
            >
              {jobOpenings.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Full Name
            <input
              required
              value={applicantForm.name}
              onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label>
              Email
              <input
                type="email"
                required
                value={applicantForm.email}
                onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={applicantForm.phone}
                onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Applied Date
              <input
                type="date"
                required
                value={applicantForm.appliedDate}
                onChange={(e) => setApplicantForm({ ...applicantForm, appliedDate: e.target.value })}
              />
            </label>
            <label>
              Status
              <select
                value={applicantForm.status}
                onChange={(e) =>
                  setApplicantForm({
                    ...applicantForm,
                    status: e.target.value as ApplicantStatus,
                  })
                }
              >
                {applicantStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea
              rows={2}
              value={applicantForm.notes}
              onChange={(e) => setApplicantForm({ ...applicantForm, notes: e.target.value })}
              placeholder="Skills, experience, referral info..."
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setApplicantModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingApplicant ? 'Save Changes' : 'Add Applicant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
