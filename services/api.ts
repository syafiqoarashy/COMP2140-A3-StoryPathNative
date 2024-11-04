import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Project, ProjectParticipantCount, Location, Tracking } from '@/constants/types';

// API configuration constants
const API_BASE_URL = "https://0b5ff8b0.uqcloud.net/api";
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk5MzgifQ.esXpKV6ZMnyUD_U-uBPS9Rh1GDGeWcsvb2uF5XI9onA";
const USERNAME = "s4829938";

// Axios instance for API requests
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
    }
});

interface ApiRequestConfig extends AxiosRequestConfig {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
}

/**
 * Generic API request function with support for GET, POST, PATCH, and DELETE methods.
 * @param endpoint - The API endpoint to request.
 * @param method - The HTTP method (default is GET).
 * @param body - Optional request payload.
 * @returns The response data of type T.
 */
async function apiRequest<T>(endpoint: string, method: ApiRequestConfig['method'] = 'GET', body: any = null): Promise<T> {
    const config: ApiRequestConfig = {
        method,
        url: endpoint,
    };

    // Headers for POST and PATCH requests to request representation return
    if (method === 'POST' || method === 'PATCH') {
        config.headers = {
            ...config.headers,
            'Prefer': 'return=representation'
        };
    }

    // Attach request body if available and include the USERNAME for tracking
    if (body) {
        config.data = { ...body, username: USERNAME };
    }

    try {
        const response = await api(config);
        return response.data;
    } catch (error) {
        console.error('API request failed:', error);
        const errorMessage = (error as any).response?.data?.message || 'An unexpected error occurred. Please try again later.';
        throw new Error(errorMessage);
    }
}

/* ============================
   Project-related Functions
   ============================ */

/**
 * Create a new project entry.
 * @param project - Partial project data to create.
 * @returns The created project.
 */
export async function createProject(project: Partial<Project>): Promise<Project> {
    return apiRequest<Project>('/project', 'POST', project);
}

/**
 * Retrieve a list of all projects.
 * @returns Array of projects.
 */
export async function getProjects(): Promise<Project[]> {
    return apiRequest<Project[]>('/project');
}

/**
 * Retrieve a specific project by its ID.
 * @param id - The ID of the project to retrieve.
 * @returns The project object.
 */
export async function getProject(id: number): Promise<Project> {
    const response = await apiRequest<Project[]>(`/project?id=eq.${id}`);
    return response[0];
}

/**
 * Update an existing project by its ID.
 * @param id - The ID of the project to update.
 * @param project - Partial project data for updates.
 * @returns The updated project.
 */
export async function updateProject(id: number, project: Partial<Project>): Promise<Project> {
    return apiRequest<Project>(`/project?id=eq.${id}`, 'PATCH', project);
}

/**
 * Delete a project by its ID.
 * @param id - The ID of the project to delete.
 */
export async function deleteProject(id: number): Promise<void> {
    return apiRequest<void>(`/project?id=eq.${id}`, 'DELETE');
}

/**
 * Retrieve all published projects.
 * @returns Array of published projects.
 */
export async function getPublishedProjects(): Promise<Project[]> {
    return apiRequest<Project[]>('/project?is_published=eq.true');
}

/**
 * Retrieve participant count for a specific project.
 * @param projectId - The project ID.
 * @returns Project participant count data.
 */
export async function getProjectParticipantCounts(projectId: number): Promise<ProjectParticipantCount> {
    const response = await apiRequest<ProjectParticipantCount[]>(`/project_participant_counts?project_id=eq.${projectId}`);
    return response[0];
}

/* ============================
   Location-related Functions
   ============================ */

/**
 * Retrieve all available locations.
 * @returns Array of all locations.
 */
export async function getLocations(): Promise<Location[]> {
    return apiRequest<Location[]>('/location');
}

/**
 * Retrieve all locations associated with a specific project.
 * @param projectId - The ID of the project.
 * @returns Array of locations.
 */
export async function getProjectLocations(projectId: number): Promise<Location[]> {
    return apiRequest<Location[]>(`/location?project_id=eq.${projectId}`);
}

/**
 * Retrieve a specific location by its ID.
 * @param id - The ID of the location.
 * @returns The location object.
 */
export async function getLocation(id: number): Promise<Location> {
    const response = await apiRequest<Location[]>(`/location?id=eq.${id}`);
    return response[0];
}

/**
 * Create a new location entry.
 * @param location - Partial location data to create.
 * @returns The created location.
 */
export async function createLocation(location: Partial<Location>): Promise<Location> {
    return apiRequest<Location>('/location', 'POST', location);
}

/**
 * Update an existing location by its ID.
 * @param id - The ID of the location to update.
 * @param location - Partial location data for updates.
 * @returns The updated location.
 */
export async function updateLocation(id: number, location: Partial<Location>): Promise<Location> {
    return apiRequest<Location>(`/location?id=eq.${id}`, 'PATCH', location);
}

/**
 * Delete a location by its ID.
 * @param id - The ID of the location to delete.
 */
export async function deleteLocation(id: number): Promise<void> {
    return apiRequest<void>(`/location?id=eq.${id}`, 'DELETE');
}

/**
 * Retrieve visited locations based on project ID and location IDs.
 * @param projectId - The project ID.
 * @param locationIds - Array of location IDs.
 * @returns Array of visited locations.
 */
export async function getVisitedLocations(projectId: number, locationIds: number[]): Promise<Location[]> {
    const locationIdsStr = locationIds.join(',');
    return apiRequest<Location[]>(`/location?project_id=eq.${projectId}&id=in.(${locationIdsStr})`);
}

/**
 * Retrieve participant count for a specific location.
 * @param locationId - The location ID.
 * @returns Location participant count data.
 */
export async function getLocationParticipantCounts(locationId: number): Promise<ProjectParticipantCount> {
    const response = await apiRequest<ProjectParticipantCount[]>(`/location_participant_counts?location_id=eq.${locationId}`);
    return response[0];
}

/* ============================
   Tracking-related Functions
   ============================ */

/**
 * Create a new tracking entry.
 * @param tracking - Partial tracking data to create.
 * @returns The created tracking entry.
 */
export async function createTracking(tracking: Partial<Tracking>): Promise<Tracking> {
    return apiRequest<Tracking>('/tracking', 'POST', tracking);
}

/**
 * Retrieve tracking data for a specific participant in a project.
 * @param projectId - The project ID.
 * @param participantUsername - The username of the participant.
 * @returns Array of tracking data.
 */
export async function getParticipantTracking(projectId: number, participantUsername: string): Promise<Tracking[]> {
    return apiRequest<Tracking[]>(`/tracking?project_id=eq.${projectId}&participant_username=eq.${participantUsername}`);
}

/**
 * Retrieve the latest tracking data for a specific participant in a project.
 * @param projectId - The project ID.
 * @param participantUsername - The username of the participant.
 * @returns Array of the latest tracking data.
 */
export async function getLatestTracking(projectId: number, participantUsername: string): Promise<Tracking[]> {
    return apiRequest<Tracking[]>(`/tracking?project_id=eq.${projectId}&participant_username=eq.${participantUsername}&order=id.desc`);
}
