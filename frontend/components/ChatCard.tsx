import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Pin, Trash2, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Group } from '@/types';

interface ChatCardProps {
  group: Group;
  onPress: () => void;
  onPin: () => void;
  onDelete: () => void;
}

export default function ChatCard({
  group,
  onPress,
  onPin,
  onDelete,
}: ChatCardProps) {
  const { colors } = useTheme();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'now' : `${minutes}m`;
    }

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Users size={24} color={colors.background} strokeWidth={2} />
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.groupName, { color: colors.text }]}
                numberOfLines={1}
              >
                {group.name}
              </Text>
            </View>

            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {group.lastMessage ? formatTime(group.lastMessage.timestamp) : ''}
            </Text>
          </View>

          <Text
            style={[styles.lastMessage, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {group.lastMessage
              ? `${group.lastMessage.senderName}: ${group.lastMessage.text}`
              : 'No messages yet'}
          </Text>

          <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
            {group.members.length} members + AI
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            onPin();
          }}
          activeOpacity={0.7}
        >
          <Pin
            size={18}
            color={group.pinned ? colors.primary : colors.textSecondary}
            strokeWidth={2}
            fill={group.pinned ? colors.primary : 'none'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          activeOpacity={0.7}
        >
          <Trash2 size={18} color={colors.error} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
