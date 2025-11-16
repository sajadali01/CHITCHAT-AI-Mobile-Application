import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface EmailTagListProps {
  emails: string[];
  onRemove: (email: string) => void;
}

export default function EmailTagList({ emails, onRemove }: EmailTagListProps) {
  const { colors } = useTheme();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {emails.map((email) => (
        <View 
          key={email} 
          style={[styles.tag, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
        >
          <Text style={[styles.email, { color: colors.primary }]}>{email}</Text>
          <TouchableOpacity
            onPress={() => onRemove(email)}
            style={styles.removeButton}
            activeOpacity={0.7}
          >
            <X size={14} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});