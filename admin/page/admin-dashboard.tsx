'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import './admin-dashboard.css'

type Project = {
	id: number
	title: string
	category: string
	short_description: string
	description: string
	stack: string[]
	project_number: string
	thumbnail_url: string | null
	live_url: string | null
	is_featured: boolean
}

type ProjectDraft = Omit<Project, 'id' | 'stack' | 'project_number' | 'thumbnail_url' | 'live_url'> & { stackText: string; live_url: string }
type Section = 'dashboard' | 'projects' | 'skills' | 'about'

const emptyDraft: ProjectDraft = {
	title: '',
	category: '',
	short_description: '',
	description: '',
	stackText: '',
	live_url: '',
	is_featured: false,
}

const thumbnailContentTypes = ['image/jpeg', 'image/png', 'image/webp']
const thumbnailMaxBytes = 5 * 1024 * 1024

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
		short_description: project.short_description,
		description: project.description,
		stackText: Array.isArray(project.stack) ? project.stack.join(', ') : '',
		live_url: project.live_url ?? '',
		is_featured: project.is_featured,
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
		if (typeof options.body === 'string') {
			headers.set('Content-Type', 'application/json')
		}
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
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
	const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
	const thumbnailInputRef = useRef<HTMLInputElement>(null)
	const [activeSection, setActiveSection] = useState<Section>('projects')
	const [search, setSearch] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [notice, setNotice] = useState('')
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
	const [deleteConfirmation, setDeleteConfirmation] = useState('')
	const [deleteError, setDeleteError] = useState('')
	const [isCheckingSession, setIsCheckingSession] = useState(true)
	const [isLoadingProjects, setIsLoadingProjects] = useState(true)
	const [isCreating, setIsCreating] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
	const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null)
	const [isSigningOut, setIsSigningOut] = useState(false)
	const deleteDialogRef = useRef<HTMLDialogElement>(null)
	const deleteNameInputRef = useRef<HTMLInputElement>(null)

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

	useEffect(() => {
		return () => {
			if (thumbnailPreviewUrl) {
				URL.revokeObjectURL(thumbnailPreviewUrl)
			}
		}
	}, [thumbnailPreviewUrl])

	useEffect(() => {
		const dialog = deleteDialogRef.current
		if (!dialog) {
			return
		}

		if (projectToDelete && !dialog.open) {
			dialog.showModal()
			deleteNameInputRef.current?.focus()
		} else if (!projectToDelete && dialog.open) {
			dialog.close()
		}
	}, [projectToDelete])

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
	const isEditorOpen = activeSection === 'projects' && (isCreating || selectedProject !== null)
	const featuredCount = projects.filter((project) => project.is_featured).length
	const isFeaturedLimitReached = featuredCount >= 4 && !draft.is_featured
	const canConfirmDelete = projectToDelete !== null && deleteConfirmation === projectToDelete.title
	const isDeletingProject = projectToDelete !== null && deletingProjectId === projectToDelete.id
	const sectionTitle = sections.find((section) => section.id === activeSection)?.label ?? 'Dashboard'

	function selectProject(project: Project) {
		if (thumbnailInputRef.current) {
			thumbnailInputRef.current.value = ''
		}
		setThumbnailFile(null)
		setThumbnailPreviewUrl(null)
		setSelectedProjectId(project.id)
		setDraft(toDraft(project))
		setIsCreating(false)
		setErrorMessage('')
		setNotice('')
	}

	function startNewProject() {
		if (thumbnailInputRef.current) {
			thumbnailInputRef.current.value = ''
		}
		setThumbnailFile(null)
		setThumbnailPreviewUrl(null)
		setSelectedProjectId(null)
		setDraft(emptyDraft)
		setIsCreating(true)
		setErrorMessage('')
		setNotice('')
	}

	function cancelEdit() {
		if (thumbnailInputRef.current) {
			thumbnailInputRef.current.value = ''
		}
		setThumbnailFile(null)
		setThumbnailPreviewUrl(null)
		setSelectedProjectId(null)
		setIsCreating(false)
		setDraft(emptyDraft)
		setErrorMessage('')
		setNotice('')
	}

	function updateDraft(field: keyof ProjectDraft, value: string) {
		setDraft((current) => ({ ...current, [field]: value }))
	}

	function chooseThumbnail(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.currentTarget.files?.[0]
		if (!file) {
			return
		}

		setErrorMessage('')
		if (!thumbnailContentTypes.includes(file.type)) {
			setThumbnailFile(null)
			setThumbnailPreviewUrl(null)
			event.currentTarget.value = ''
			setErrorMessage('Choose a JPEG, PNG, or WebP image.')
			return
		}
		if (file.size > thumbnailMaxBytes) {
			setThumbnailFile(null)
			setThumbnailPreviewUrl(null)
			event.currentTarget.value = ''
			setErrorMessage('The thumbnail must be 5 MB or smaller.')
			return
		}

		setThumbnailFile(file)
		setThumbnailPreviewUrl(URL.createObjectURL(file))
	}

	async function saveProject(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setErrorMessage('')
		setNotice('')
		if (isCreating && !thumbnailFile) {
			setErrorMessage('Choose a project thumbnail before adding this project.')
			return
		}
		setIsSaving(true)

		const payload = {
			title: draft.title.trim(),
			category: draft.category.trim(),
			short_description: draft.short_description.trim(),
			description: draft.description.trim(),
			stack: draft.stackText.split(',').map((technology) => technology.trim()).filter(Boolean),
			live_url: draft.live_url.trim() || null,
			is_featured: draft.is_featured,
		}

		const isNewProject = isCreating
		let savedProject: Project
		try {
			if (!isNewProject && selectedProjectId === null) {
				throw new Error('Select a project to edit.')
			}

			savedProject = await projectRequest<Project>(
				isNewProject ? '/api/projects' : `/api/projects/${selectedProjectId}`,
				{
					method: isNewProject ? 'POST' : 'PATCH',
					body: JSON.stringify(payload),
				}
			)
		} catch (saveError) {
			setErrorMessage(getMessage(saveError, 'Could not save the project.'))
			setIsSaving(false)
			return
		}

		if (thumbnailFile) {
			setIsUploadingThumbnail(true)
			try {
				savedProject = await projectRequest<Project>(`/api/projects/${savedProject.id}/thumbnail`, {
					method: 'POST',
					headers: { 'Content-Type': thumbnailFile.type },
					body: thumbnailFile,
				})
				setThumbnailFile(null)
				setThumbnailPreviewUrl(null)
				if (thumbnailInputRef.current) {
					thumbnailInputRef.current.value = ''
				}
			} catch (uploadError) {
				setProjects((current) =>
					isNewProject
						? [...current, savedProject]
						: current.map((project) => (project.id === savedProject.id ? savedProject : project))
				)
				setSelectedProjectId(savedProject.id)
				setDraft(toDraft(savedProject))
				setIsCreating(false)
				setErrorMessage(`Project details saved, but its thumbnail was not uploaded: ${getMessage(uploadError, 'Please try again.')}`)
				setIsSaving(false)
				setIsUploadingThumbnail(false)
				return
			}
		}

		setProjects((current) =>
			isNewProject
				? [...current, savedProject]
				: current.map((project) => (project.id === savedProject.id ? savedProject : project))
		)
		setSelectedProjectId(savedProject.id)
		setDraft(toDraft(savedProject))
		setIsCreating(false)
		setNotice(thumbnailFile ? 'Project and thumbnail saved.' : isNewProject ? 'Project added.' : 'Changes saved.')
		setIsSaving(false)
		setIsUploadingThumbnail(false)
	}

	function requestDeleteConfirmation(project: Project) {
		setProjectToDelete(project)
		setDeleteConfirmation('')
		setDeleteError('')
	}

	function dismissDeleteConfirmation() {
		if (deletingProjectId !== null) {
			return
		}
		setProjectToDelete(null)
		setDeleteConfirmation('')
		setDeleteError('')
	}

	async function deleteProject(project: Project) {
		setErrorMessage('')
		setNotice('')
		setDeleteError('')
		setDeletingProjectId(project.id)

		try {
			const result = await projectRequest<{ deleted: { id: number; title: string }; projects: Project[] }>(
				`/api/projects/${project.id}`,
				{ method: 'DELETE' }
			)
			if (thumbnailInputRef.current) {
				thumbnailInputRef.current.value = ''
			}
			const remainingProjects = result.projects
			setProjects(remainingProjects)
			if (selectedProjectId === project.id) {
				if (remainingProjects[0]) {
					selectProject(remainingProjects[0])
				} else {
					startNewProject()
				}
			}
			setNotice('Project deleted.')
			setProjectToDelete(null)
			setDeleteConfirmation('')
		} catch (deleteError) {
			setDeleteError(getMessage(deleteError, 'Could not delete the project.'))
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
		<div className={`admin-shell${isEditorOpen ? ' admin-shell--editor-open' : ''}`}>
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
					{activeSection === 'projects' && <span>{projects.length} Total · {featuredCount}/4 pinned</span>}
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
													<span className="admin-project-mark" aria-hidden="true">
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
														onClick={() => requestDeleteConfirmation(project)}
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

					{isEditorOpen && (
					<aside className="admin-editor" aria-label={isCreating ? 'Add project' : 'Quick edit project'}>
						<div className="admin-editor-heading">
							<h2>{isCreating ? 'New Project' : 'Quick Edit'}</h2>
							<button type="button" aria-label="Cancel editing" onClick={cancelEdit}>×</button>
						</div>
						{selectedProject || isCreating ? (
							<form className="admin-project-form" onSubmit={(event) => void saveProject(event)}>
								<p className="admin-project-number-note">
									Project number: <strong>{selectedProject ? selectedProject.project_number : 'assigned automatically when saved'}</strong>
								</p>
								<label>
									<span>Project Name</span>
									<input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} />
								</label>
								<label>
									<span>Category</span>
									<input required value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} />
								</label>
								<label className="admin-project-short-description">
									<span>Short Description <small>Shown in project lists</small></span>
									<textarea required rows={3} value={draft.short_description} onChange={(event) => updateDraft('short_description', event.target.value)} />
								</label>
								<label>
									<span>Full Description <small>Shown on the project page</small></span>
									<textarea required rows={5} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} />
								</label>
								<label>
									<span>Tech Stack <small>Separate items with commas</small></span>
									<input value={draft.stackText} onChange={(event) => updateDraft('stackText', event.target.value)} />
								</label>
								<label>
									<span>Live Project URL <small>Optional</small></span>
									<input
										type="url"
										placeholder="https://example.com"
										value={draft.live_url}
										onChange={(event) => updateDraft('live_url', event.target.value)}
									/>
								</label>
								<div className="admin-featured-control">
									<label>
										<input
											type="checkbox"
											checked={draft.is_featured}
											disabled={isFeaturedLimitReached}
											onChange={(event) => setDraft((current) => ({ ...current, is_featured: event.target.checked }))}
										/>
										<span>Pin to homepage</span>
									</label>
									<small>
										{isFeaturedLimitReached ? 'All 4 homepage spots are filled. Unpin a project first.' : `${featuredCount}/4 projects pinned`}
									</small>
								</div>
								<div className="admin-thumbnail-field">
									<div
										className="admin-thumbnail-preview"
										style={{ backgroundImage: `url("${thumbnailPreviewUrl ?? selectedProject?.thumbnail_url ?? ''}")` }}
										role={thumbnailPreviewUrl || selectedProject?.thumbnail_url ? 'img' : undefined}
										aria-label={thumbnailPreviewUrl || selectedProject?.thumbnail_url ? `${draft.title || 'Project'} thumbnail preview` : undefined}
									>
										{!thumbnailPreviewUrl && !selectedProject?.thumbnail_url && <span>Thumbnail preview</span>}
									</div>
									<label>
										<span>Project Thumbnail <small>JPEG, PNG, or WebP · max 5 MB</small></span>
										<input
											ref={thumbnailInputRef}
											type="file"
											accept="image/jpeg,image/png,image/webp"
											onChange={chooseThumbnail}
										/>
									</label>
									{thumbnailFile && <small className="admin-thumbnail-filename">Selected: {thumbnailFile.name}</small>}
								</div>
								{errorMessage && <p className="admin-feedback admin-feedback--error" role="alert">{errorMessage}</p>}
								{notice && <p className="admin-feedback" role="status">{notice}</p>}
								<div className="admin-form-actions">
									<button className="admin-primary-button" type="submit" disabled={isSaving}>
										{isUploadingThumbnail ? 'Uploading thumbnail...' : isSaving ? 'Saving...' : isCreating ? 'Add Project' : 'Save Changes'}
									</button>
									<button className="admin-secondary-button" type="button" onClick={cancelEdit}>Cancel</button>
								</div>
							</form>
						) : (
							<p className="admin-editor-empty">Select a project to edit it.</p>
						)}
					</aside>
					)}
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
			<dialog
				ref={deleteDialogRef}
				className="admin-delete-dialog"
				aria-labelledby="admin-delete-title"
				aria-describedby="admin-delete-description"
				onCancel={(event) => {
					event.preventDefault()
					dismissDeleteConfirmation()
				}}
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						dismissDeleteConfirmation()
					}
				}}
			>
				{projectToDelete && (
					<div className="admin-delete-dialog-content">
						<h2 id="admin-delete-title">Delete project?</h2>
						<p id="admin-delete-description">
							To confirm, type the project name exactly as shown: <strong className="admin-delete-project-name">{projectToDelete.title}</strong>
						</p>
						<label className="admin-delete-confirmation-field">
							Project name
							<input
								ref={deleteNameInputRef}
								autoComplete="off"
								value={deleteConfirmation}
								onChange={(event) => setDeleteConfirmation(event.target.value)}
								disabled={isDeletingProject}
							/>
						</label>
						{deleteError && <p className="admin-delete-error" role="alert">{deleteError}</p>}
						<div className="admin-delete-actions">
							<button className="admin-secondary-button" type="button" onClick={dismissDeleteConfirmation} disabled={isDeletingProject}>
								Cancel
							</button>
							<button
								className="admin-delete-confirm-button"
								type="button"
								disabled={!canConfirmDelete || isDeletingProject}
								onClick={() => void deleteProject(projectToDelete)}
							>
								{isDeletingProject ? 'Deleting...' : 'Delete project'}
							</button>
						</div>
					</div>
				)}
			</dialog>
		</div>
	)
}
