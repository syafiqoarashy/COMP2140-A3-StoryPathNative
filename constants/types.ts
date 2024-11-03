export interface Project {
    id: number;
    title: string;
    description: string | null;
    is_published: boolean;
    participant_scoring: string | null;
    username: string;
    instructions: string | null;
    initial_clue: string | null;
    homescreen_display: string | null;
}

export interface ProjectParticipantCount {
    project_id: number;
    number_participants: number;
}

export interface Location {
    id: number;
    project_id: number;
    location_name: string;
    location_trigger: string;
    location_position: string | null;
    location_order: number;
    username: string;
    location_content: string | null;
    extra: string | null;
    clue: string | null;
    score_points: number | null;
}

export interface Tracking {
    id: number;
    project_id: number;
    location_id: number;
    username: string;
    points: number | null;
    participant_username: string | null;
}

export interface LocationContent {
    location: Location;
    participantCount: number;
    isExpanded: boolean;
}

export interface LocationCoords {
    latitude: number;
    longitude: number;
}
