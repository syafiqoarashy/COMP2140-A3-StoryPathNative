import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Project, ProjectParticipantCount, Location, Tracking } from '@/constants/types';

const API_BASE_URL = "https://0b5ff8b0.uqcloud.net/api";
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk5MzgifQ.esXpKV6ZMnyUD_U-uBPS9Rh1GDGeWcsvb2uF5XI9onA";
const USERNAME = "s4829938";

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

async function apiRequest<T>(endpoint: string, method: ApiRequestConfig['method'] = 'GET', body: any = null): Promise<T> {
    const config: ApiRequestConfig = {
        method,
        url: endpoint,
    };

    if (method === 'POST' || method === 'PATCH') {
        config.headers = {
            ...config.headers,
            'Prefer': 'return=representation'
        };
    }

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

export async function createProject(project: Partial<Project>): Promise<Project> {
    return apiRequest<Project>('/project', 'POST', project);
}

export async function getProjects(): Promise<Project[]> {
    return apiRequest<Project[]>('/project');
}

export async function getProject(id: number): Promise<Project> {
    return apiRequest<Project>(`/project?id=eq.${id}`);
}

export async function updateProject(id: number, project: Partial<Project>): Promise<Project> {
    return apiRequest<Project>(`/project?id=eq.${id}`, 'PATCH', project);
}

export async function deleteProject(id: number): Promise<void> {
    return apiRequest<void>(`/project?id=eq.${id}`, 'DELETE');
}

export async function getLocations(): Promise<Location[]> {
    return apiRequest<Location[]>('/location');
}

export async function getLocation(id: number): Promise<Location> {
    return apiRequest<Location>(`/location?id=eq.${id}`);
}

export function getLocationsByProjectId(locations: Location[], projectId: number): Location[] {
    return locations.filter(location => location.project_id === projectId);
}

export async function createLocation(location: Partial<Location>): Promise<Location> {
    return apiRequest<Location>('/location', 'POST', location);
}

export async function updateLocation(id: number, location: Partial<Location>): Promise<Location> {
    return apiRequest<Location>(`/location?id=eq.${id}`, 'PATCH', location);
}

export async function deleteLocation(id: number): Promise<void> {
    return apiRequest<void>(`/location?id=eq.${id}`, 'DELETE');
}

export async function createTracking(tracking: Partial<Tracking>): Promise<Tracking> {
    return apiRequest<Tracking>('/tracking', 'POST', tracking);
}

export async function getProjectParticipantCounts(projectId: number): Promise<ProjectParticipantCount[]> {
    return apiRequest<ProjectParticipantCount[]>(`/project_participant_counts?project_id=eq.${projectId}`);
}

export async function getLocationParticipantCounts(locationId: number): Promise<ProjectParticipantCount[]> {
    return apiRequest<ProjectParticipantCount[]>(`/location_participant_counts?location_id=eq.${locationId}`);
}

export async function getPublishedProjects(): Promise<Project[]> {
    return apiRequest<Project[]>('/project?is_published=eq.true');
}

export async function getParticipantTracking(projectId: number, participantUsername: string): Promise<Tracking[]> {
    return apiRequest<Tracking[]>(`/tracking?project_id=eq.${projectId}&participant_username=eq.${participantUsername}`);
}
