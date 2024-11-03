import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/user';
import { getProjectParticipantCounts, getProjects, Project, ProjectParticipantCount } from '@/services/api';

type ProjectWithParticipantCount = Project & {
  participant_count?: number;
};

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<ProjectWithParticipantCount[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { username } = useUser();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData: Project[] = await getProjects();
      const publishedProjects = projectsData.filter(project => project.is_published);
      const projectsWithCounts = await Promise.all(
        publishedProjects.map(async (project: Project) => {
          const [participantCount]: ProjectParticipantCount[] = await getProjectParticipantCounts(project.id);
          return {
            ...project,
            participant_count: participantCount?.number_participants || 0,
          };
        })
      );
      setProjects(projectsWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const renderProjectItem = ({ item }: { item: ProjectWithParticipantCount }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-4 rounded-lg shadow-md"
      onPress={() => router.push(`/project/${item.id}`)}
    >
      <Text className="text-lg font-bold mb-2">{item.title}</Text>
      <Text className="text-gray-600 mb-2">{item.description || 'No description'}</Text>
      <Text className="text-sm text-gray-500">
        Participants: {item.participant_count}
      </Text>
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
