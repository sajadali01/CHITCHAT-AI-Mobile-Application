import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import EmailTagList from '@/components/EmailTagList';
import { validateEmail } from '@/utils/validators';
import { createGroup, getAllUsers } from '@/services/api';

export default function GroupCreateScreen() {
  const [groupName, setGroupName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [groupNameError, setGroupNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;

    if (groupName.trim().length === 0) {
      setGroupNameError('Please enter a group name');
      isValid = false;
    } else {
      setGroupNameError('');
    }

    if (emails.length < 2) {
      setEmailError('Add at least 2 members');
      isValid = false;
    } else if (emails.length > 10) {
      setEmailError('A group cannot have more than 10 members');
      isValid = false;
    } else {
      setEmailError('');
    }

    return isValid;
  };

  const addEmail = () => {
    if (!validateEmail(currentEmail)) {
      setEmailError('Enter a valid email address');
      return;
    }

    if (emails.includes(currentEmail)) {
      setEmailError('Email already added');
      return;
    }

    if (emails.length >= 10) {
      setEmailError('A group cannot have more than 10 members');
      return;
    }

    setEmails((prev) => [...prev, currentEmail]);
    setCurrentEmail('');
    setEmailError('');
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
    setEmailError('');
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Fetch all users
      const users = await getAllUsers();
      // Map emails to user IDs
      const userIds = emails.map((email) => {
        const user = users.find((u) => u.email === email);
        if (!user) throw new Error(`User not found for email: ${email}`);
        return user._id || user.id;
      });
      const group = await createGroup(groupName.trim(), userIds);
      console.log('Group : ', group);
      // Navigate to the new group chat using group._id from backend
      router.replace(`/group-chat/${group._id}`);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>New Group</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.iconContainer}>
              <View
                style={[styles.groupIcon, { backgroundColor: colors.primary }]}
              >
                <Users size={32} color={colors.background} strokeWidth={2} />
              </View>
            </View>

            <Input
              label="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              error={groupNameError}
              placeholder="Enter group name"
            />

            <View style={styles.membersSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Members
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Add members by email address (AI assistant will be included
                automatically)
              </Text>

             <View style={styles.emailInputContainer}>
  <View style={{ flex: 1 }}>
    <Input
      label="Email Address"
      value={currentEmail}
      onChangeText={setCurrentEmail}
      error={emailError}
      placeholder="user@example.com"
      keyboardType="email-address"
      autoCapitalize="none"
      onSubmitEditing={addEmail}
      returnKeyType="done"
    />
  </View>

  <Button
    title="Add"
    onPress={addEmail}
    disabled={!currentEmail.trim()}
    style={styles.addButton}
  />
</View>


              {emails.length > 0 && (
                <EmailTagList emails={emails} onRemove={removeEmail} />
              )}

              <View style={styles.memberCount}>
                <Text
                  style={[
                    styles.memberCountText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {emails.length} member{emails.length !== 1 ? 's' : ''} + AI
                  Assistant
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Create Group"
            onPress={handleCreateGroup}
            loading={loading}
            disabled={!groupName.trim() || emails.length < 2}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
 emailInputContainer: {
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: 12,
  flexWrap: 'wrap',
},

  addButton: {
    minWidth: 80,
    // marginTop: 25,
    alignItems: 'center',
  },
  memberCount: {
    alignItems: 'center',
    paddingTop: 8,
  },
  memberCountText: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
