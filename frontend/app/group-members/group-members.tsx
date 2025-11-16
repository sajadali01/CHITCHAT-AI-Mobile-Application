import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { getGroup, leaveGroup } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import useOnlineUsers from '@/hooks/useOnlineUsers';
import Toast from 'react-native-toast-message';

interface Member {
  id: string;
  name: string;
  isOnline?: boolean;
}

export default function GroupMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { onlineUsers } = useOnlineUsers(user?.id);
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Leave group handler
  async function handleLeaveGroup() {
    if (!id || !user?.id) return;
    
    setLeaving(true);
    try {
      await leaveGroup(id);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'You have left the group successfully',
      });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to leave group:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to leave group. Please try again.',
      });
    } finally {
      setLeaving(false);
      setLeaveModalVisible(false);
    }
  }

  const showLeaveConfirmation = () => {
    setLeaveModalVisible(true);
  };

  useEffect(() => {
    async function fetchMembers() {
      if (!id) return;
      try {
        const group = await getGroup(id);
        let memberList: Member[] = [];
        if (Array.isArray(group.members) && group.members.length > 0) {
          memberList = group.members.map((user: any) => ({
            id: user._id || user.id,
            name: user.name || user.email || 'Unknown',
            isOnline: onlineUsers.includes(user._id || user.id),
          }));
        }
        // Add AI Assistant
        memberList.push({
          id: 'ai-assistant',
          name: 'AI Assistant',
          isOnline: true,
        });
        setMembers(memberList);
      } catch (err) {
        setMembers([
          { id: 'ai-assistant', name: 'AI Assistant', isOnline: true },
        ]);
      }
    }
    fetchMembers();
  }, [id, onlineUsers]);

  const renderMember = ({ item }: { item: Member }) => (
    <View style={[styles.memberItem, { borderBottomColor: colors.border }]}>
      <View style={styles.avatar}>
        <Text style={[styles.avatarText, { color: colors.text }]}>
          {item.name[0].toUpperCase()}
        </Text>
      </View>

      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {item.name}
        </Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.isOnline ? '#4CAF50' : '#9E9E9E' },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {item.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {item.id === 'ai-assistant' && (
        <Text
          style={[
            styles.roleTag,
            { backgroundColor: colors.primary, color: colors.background },
          ]}
        >
          AI
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Group Members
        </Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Leave Group Button (only for real users, not AI) */}
      {user?.id !== 'ai-assistant' && (
        <TouchableOpacity
          style={[styles.leaveButton, { backgroundColor: colors.primary }]}
          onPress={showLeaveConfirmation}
        >
          <Text style={[styles.leaveButtonText, { color: colors.background }]}>
            Leave Group
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={leaveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLeaveModalVisible(false)}>
          <View style={styles.modalOverlay}>
                         <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Confirm Leave Group
              </Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                Are you sure you want to leave this group? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleLeaveGroup}
                  disabled={leaving}
                >
                  <Text style={[styles.modalButtonText, { color: colors.background }]}>
                    {leaving ? 'Leaving...' : 'Leave Group'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setLeaveModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBAD12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  leaveButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Use same shadow/elevation as other buttons if any
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
