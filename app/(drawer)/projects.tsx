import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/user';
import { getProjectParticipantCounts, getPublishedProjects } from '@/services/api';
import { Project } from '@/constants/types';
import { useFocusEffect } from '@react-navigation/native';

type ProjectWithParticipantCount = Project & {
  participant_count: number;
};

/**
 * ProjectsScreen component displays a list of published projects
 * with participant counts. Allows navigation to project details.
 *
 * @returns {JSX.Element} The projects screen with loading and error handling.
 */
export default function ProjectsScreen() {
  const [projects, setProjects] = useState<ProjectWithParticipantCount[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { username } = useUser();

  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Fetches the participant count for a given project.
   *
   * @async
   * @param {number} projectId - The ID of the project.
   * @returns {Promise<number>} The number of participants or 0 if an error occurs.
   */
  const getParticipantCount = async (projectId: number): Promise<number> => {
    try {
      const participantData = await getProjectParticipantCounts(projectId);
      return participantData?.number_participants ?? 0;
    } catch (error) {
      console.error(`Error fetching participant count for project ${projectId}:`, error);
      Alert.alert("Error", `Could not load participant count for project ${projectId}`);
      return 0;
    }
  };

  /**
   * Fetches published projects and their participant counts,
   * handling errors and displaying them to the user.
   */
  const fetchProjects = async () => {
    try {
      const publishedProjects = await getPublishedProjects();
      
      const projectsWithCounts = await Promise.all(
        publishedProjects.map(async (project) => {
          const participant_count = await getParticipantCount(project.id);
          return { ...project, participant_count };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert("Error", "Could not load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  /**
   * Renders an individual project item.
   *
   * @param {Object} item - The project item to render.
   * @param {number} item.id - The project's unique ID.
   * @param {string} item.title - The project's title.
   * @param {string | null} item.description - The project's description.
   * @param {number} item.participant_count - The number of participants in the project.
   * @returns {JSX.Element} The rendered project item component.
   */
  const renderProjectItem = ({ item }: { item: ProjectWithParticipantCount }) => (
    <TouchableOpacity
      className="bg-white p-5 mb-4 rounded-lg shadow-md border border-gray-200"
      onPress={() => router.push(`/project/${item.id}`)}
    >
      <Text className="text-xl font-semibold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-gray-600 text-sm mb-3">{item.description || 'No description available'}</Text>
      <Text className="text-base text-[#7862FC] font-medium">Participants: {item.participant_count}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7862FC" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Projects</Text>
      {username ? (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">No published projects found</Text>
          }
        />
      ) : (
        <Text className="text-center text-gray-500">
          Please set up your profile to view projects
        </Text>
      )}
    </View>
  );
}
