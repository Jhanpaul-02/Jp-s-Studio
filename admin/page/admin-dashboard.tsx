'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import './admin-dashboard.css'

type Project = {
	id: number
	title: string
	category: string
	description: string
	stack: string[]
	project_number: string
	accent: string
}

type ProjectDraft = Omit<Project, 'id' | 'stack'> & { stackText: string }
type Section = 'dashboard' | 'projects' | 'skills' | 'about'

const emptyDraft: ProjectDraft = {
	title: '',
	category: '',
	description: '',
	stackText: '',
	project_number: '',
	accent: 'workspace',
}

const sections: { id: Section; label: string }[] = [
	{ id: 'dashboard', label: 'Dashboard' },
	{ id: 'projects', label: 'Projects' },
	{ id: 'skills', label: 'Skills' },
	{ id: 'about', label: 'About Me' },
]

function toDraft(project: Project): ProjectDraft {
	return {
		title: project.title,
		category: project.category,
		description: project.description,
		stackText: Array.isArray(project.stack) ? project.stack.join(', ') : '',
		project_number: project.project_number,
		accent: project.accent,
	}
}

function getMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback
}

async function projectRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
	const { data } = await supabase.auth.getSession()
	const headers = new Headers(options.headers)

	if (data.session?.access_token) {
		headers.set('Authorization', `Bearer ${data.session.access_token}`)
	}

	if (options.body) {
		headers.set('Content-Type', 'application/json')
	}

	const response = await fetch(path, { ...options, headers, cache: 'no-store' })
	const payload: unknown = await response.json().catch(() => null)

	if (!response.ok) {
		const message =
			typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
				? payload.error
				: 'The project request failed.'

		throw new Error(message)
	}

	return payload as T
}

export default function AdminDashboard() {
	const router = useRouter()
	const [adminEmail, setAdminEmail] = useState('')
	const [projects, setProjects] = useState<Project[]>([])
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
	const [draft, setDraft] = useState<ProjectDraft>(emptyDraft)
	const [activeSection, setActiveSection] = useState<Section>('projects')
	const [search, setSearch] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [notice, setNotice] = useState('')
	const [isCheckingSession, setIsCheckingSession] = useState(true)
	const [isLoadingProjects, setIsLoadingProjects] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null)
	const [isSigningOut, setIsSigningOut] = useState(false)

	useEffect(() => {
		let isMounted = true

		async function loadDashboard() {
			const { data, error } = await supabase.auth.getSession()

			if (!isMounted) {
				return
			}

			if (error || !data.session) {
				router.replace('/')
				return
			}

			setAdminEmail(data.session.user.email ?? 'System Admin')

			try {
				const projectList = await projectRequest<Project[]>('/api/projects')

				if (!isMounted) {
					return
				}

				setProjects(projectList)
				if (projectList[0]) {
					setSelectedProjectId(projectList[0].id)
					setDraft(toDraft(projectList[0]))
				}
			} catch (requestError) {
				if (isMounted) {
					setErrorMessage(getMessage(requestError, 'Could not load projects.'))
				}
			} finally {
				if (isMounted) {
					setIsLoadingProjects(false)
				}
			}

			if (isMounted) {
				setIsCheckingSession(false)
			}
		}

		void loadDashboard().catch(() => {
			if (isMounted) {
				router.replace('/')
			}
		})

		return () => {
			isMounted = false
		}
	}, [router])

	const filteredProjects = projects.filter((project) => {
		const query = search.trim().toLowerCase()
		return (
			query === '' ||
			project.title.toLowerCase().includes(query) ||
			project.category.toLowerCase().includes(query) ||
			project.stack.some((technology) => technology.toLowerCase().includes(query))
		)
	})
	const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null
	const sectionTitle = sections.find((section) => section.id === activeSection)?.label ?? 'Dashboard'

	function selectProject(project: Project) {
		setSelectedProjectId(project.id)
		setDraft(toDraft(project))
		setIsCreating(false)
		setErrorMessage('')
		setNotice('')
	}

	function startNewProject() {
		setSelectedProjectId(null)
		setDraft(emptyDraft)
		setIsCreating(true)
		setErrorMessage('')
		setNotice('')
	}

	function cancelEdit() {
		setIsCreating(false)
		setErrorMessage('')
		setNotice('')
		if (selectedProject) {
			setDraft(toDraft(selectedProject))
		} else if (projects[0]) {
			selectProject(projects[0])
		} else {
			setDraft(emptyDraft)
		}
	}

	function updateDraft(field: keyof ProjectDraft, value: string) {
		setDraft((current) => ({ ...current, [field]: value }))
	}

	async function saveProject(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setErrorMessage('')
		setNotice('')
		setIsSaving(true)

		const payload = {
			title: draft.title.trim(),
			category: draft.category.trim(),
			description: draft.description.trim(),
			stack: draft.stackText.split(',').map((technology) => technology.trim()).filter(Boolean),
			project_number: draft.project_number.trim(),
			accent: draft.accent,
		}

		try {
			const isNewProject = isCreating
			if (!isNewProject && selectedProjectId === null) {
				throw new Error('Select a project to edit.')
			}

			const savedProject = await projectRequest<Project>(
				isNewProject ? '/api/projects' : `/api/projects/${selectedProjectId}`,
				{
					method: isNewProject ? 'POST' : 'PATCH',
					body: JSON.stringify(payload),
				}
			)

			setProjects((current) =>
				isNewProject
					? [...current, savedProject]
					: current.map((project) => (project.id === savedProject.id ? savedProject : project))
			)
			setSelectedProjectId(savedProject.id)
			setDraft(toDraft(savedProject))
			setIsCreating(false)
			setNotice(isNewProject ? 'Project added.' : 'Changes saved.')
		} catch (saveError) {
			setErrorMessage(getMessage(saveError, 'Could not save the project.'))
		} finally {
			setIsSaving(false)
		}
	}

	async function deleteProject(project: Project) {
		if (!window.confirm(`Delete "${project.title}"?`)) {
			return
		}

		setErrorMessage('')
		setNotice('')
		setDeletingProjectId(project.id)

		try {
			await projectRequest(`/api/projects/${project.id}`, { method: 'DELETE' })
			const remainingProjects = projects.filter((item) => item.id !== project.id)
			setProjects(remainingProjects)
			if (selectedProjectId === project.id) {
				if (remainingProjects[0]) {
					selectProject(remainingProjects[0])
				} else {
					startNewProject()
				}
			}
			setNotice('Project deleted.')
		} catch (deleteError) {
			setErrorMessage(getMessage(deleteError, 'Could not delete the project.'))
		} finally {
			setDeletingProjectId(null)
		}
	}

	async function signOut() {
		setIsSigningOut(true)
		const { error } = await supabase.auth.signOut()
		if (error) {
			setErrorMessage('Could not sign out. Please try again.')
			setIsSigningOut(false)
			return
		}
		router.replace('/')
	}

	if (isCheckingSession) {
		return <main className="admin-loading" role="status">Checking your session...</main>
	}

	return (
		<div className="admin-shell">
			<aside className="admin-sidebar">
				<div className="admin-brand">
					<Image src="/studio-logo.png" alt="" width={32} height={32} />
					<strong>Jp&apos;s Studio</strong>
				</div>
				<nav className="admin-navigation" aria-label="Admin sections">
					<p>Console</p>
					{sections.map((section) => (
						<button
							key={section.id}
							type="button"
							className={activeSection === section.id ? 'is-active' : ''}
							aria-current={activeSection === section.id ? 'page' : undefined}
							onClick={() => setActiveSection(section.id)}
						>
							{section.label}
						</button>
					))}
				</nav>
				<div className="admin-account">
					<span className="admin-account-avatar" aria-hidden="true">
						{adminEmail.slice(0, 1).toUpperCase()}
					</span>
					<span className="admin-account-copy">
						<strong>{adminEmail}</strong>
						<small>System Admin</small>
					</span>
					<button type="button" onClick={() => void signOut()} disabled={isSigningOut}>
						{isSigningOut ? 'Signing out...' : 'Sign out'}
					</button>
				</div>
			</aside>

			<header className="admin-topbar">
				<div className="admin-page-heading">
					<h1>{sectionTitle}</h1>
					{activeSection === 'projects' && <span>{projects.length} Total</span>}
				</div>
				{activeSection === 'projects' && (
					<div className="admin-topbar-actions">
						<label className="admin-search">
							<span className="visually-hidden">Search projects</span>
							<input
								type="search"
								placeholder="Search projects..."
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</label>
						<button className="admin-primary-button" type="button" onClick={startNewProject}>
							Add New Project
						</button>
					</div>
				)}
			</header>

			{activeSection === 'projects' ? (
				<>
					<main className="admin-main admin-main--projects">
						{errorMessage && <p className="admin-feedback admin-feedback--error" role="alert">{errorMessage}</p>}
						{notice && <p className="admin-feedback" role="status">{notice}</p>}
						<div className="admin-table-scroll">
							<table className="admin-project-table">
								<thead>
									<tr>
										<th scope="col">Project name</th>
										<th scope="col">Category</th>
										<th scope="col">Tech stack</th>
										<th scope="col">No.</th>
										<th scope="col">Actions</th>
									</tr>
								</thead>
								<tbody>
									{isLoadingProjects && <tr><td className="admin-table-message" colSpan={5}>Loading projects...</td></tr>}
									{!isLoadingProjects && filteredProjects.length === 0 && (
										<tr><td className="admin-table-message" colSpan={5}>{projects.length ? 'No matching projects.' : 'No projects yet. Add your first project.'}</td></tr>
									)}
									{filteredProjects.map((project) => (
										<tr key={project.id} className={selectedProjectId === project.id && !isCreating ? 'is-selected' : ''}>
											<td>
												<div className="admin-project-name">
													<span className="admin-project-mark" data-accent={project.accent} aria-hidden="true">
														{project.title.slice(0, 1).toUpperCase()}
													</span>
													<button type="button" onClick={() => selectProject(project)}>{project.title}</button>
												</div>
											</td>
											<td>{project.category}</td>
											<td>
												<div className="admin-stack-list">
													{project.stack.map((technology) => <span key={technology}>{technology}</span>)}
												</div>
											</td>
											<td>{project.project_number}</td>
											<td>
												<div className="admin-row-actions">
													<button type="button" onClick={() => selectProject(project)}>Edit</button>
													<button
														type="button"
														onClick={() => void deleteProject(project)}
														disabled={deletingProjectId === project.id}
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
						<p className="admin-results-count" aria-live="polite">
							Showing {filteredProjects.length} of {projects.length} projects
						</p>
					</main>

					<aside className="admin-editor" aria-label={isCreating ? 'Add project' : 'Quick edit project'}>
						<div className="admin-editor-heading">
							<h2>{isCreating ? 'New Project' : 'Quick Edit'}</h2>
							<button type="button" aria-label="Cancel editing" onClick={cancelEdit}>×</button>
						</div>
						{selectedProject || isCreating ? (
							<form className="admin-project-form" onSubmit={(event) => void saveProject(event)}>
								<label>
									<span>Project Name</span>
									<input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} />
								</label>
								<label>
									<span>Category</span>
									<input required value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} />
								</label>
								<label>
									<span>Description</span>
									<textarea required rows={4} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} />
								</label>
								<label>
									<span>Tech Stack <small>Separate items with commas</small></span>
									<input value={draft.stackText} onChange={(event) => updateDraft('stackText', event.target.value)} />
								</label>
								<div className="admin-form-row">
									<label>
										<span>Project Number</span>
										<input required value={draft.project_number} onChange={(event) => updateDraft('project_number', event.target.value)} />
									</label>
									<label>
										<span>Accent</span>
										<select value={draft.accent} onChange={(event) => updateDraft('accent', event.target.value)}>
											<option value="commerce">Commerce</option>
											<option value="workspace">Workspace</option>
											<option value="studio">Studio</option>
											<option value="analytics">Analytics</option>
										</select>
									</label>
								</div>
								{errorMessage && <p className="admin-feedback admin-feedback--error" role="alert">{errorMessage}</p>}
								{notice && <p className="admin-feedback" role="status">{notice}</p>}
								<div className="admin-form-actions">
									<button className="admin-primary-button" type="submit" disabled={isSaving}>
										{isSaving ? 'Saving...' : isCreating ? 'Add Project' : 'Save Changes'}
									</button>
									<button className="admin-secondary-button" type="button" onClick={cancelEdit}>Cancel</button>
								</div>
							</form>
						) : (
							<p className="admin-editor-empty">Select a project to edit it.</p>
						)}
					</aside>
				</>
			) : (
				<main className="admin-main admin-main--placeholder">
					{activeSection === 'dashboard' ? (
						<section className="admin-overview">
							<p className="admin-section-label">Jp&apos;s Studio / Overview</p>
							<h2>Welcome back</h2>
							<p>You&apos;re signed in as {adminEmail}.</p>
							<strong>{projects.length} projects</strong>
							<button type="button" onClick={() => setActiveSection('projects')}>Manage projects</button>
						</section>
					) : (
						<section className="admin-overview">
							<p className="admin-section-label">Jp&apos;s Studio / Console</p>
							<h2>{sectionTitle}</h2>
							<p>This section isn&apos;t connected yet.</p>
						</section>
					)}
				</main>
			)}
		</div>
	)
}
