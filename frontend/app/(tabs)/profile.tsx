import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Palette,
  UserPlus,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Share,
  X,
  Lock,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getProfile } from '@/services/api';
import { Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

interface SettingItem {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState({
    push: true,
    mentions: true,
    previews: false,
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadSettings();
    fetchUserProfile();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await SecureStore.getItemAsync('notification_settings');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load settings');
    }
  };
  const [showAbout, setShowAbout] = useState(false);

const toggleAbout = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setShowAbout(!showAbout);
};


  const fetchUserProfile = async () => {
    try {
      const profile = await getProfile();
      // Note: We can't update user in context since setUser is not exposed
      // The profile will be updated on next app restart
      console.log('Profile fetched:', profile);
    } catch (error) {
      console.log('Failed to fetch user profile');
    }
  };

  const saveNotificationSettings = async (
    newSettings: typeof notifications
  ) => {
    try {
      await SecureStore.setItemAsync(
        'notification_settings',
        JSON.stringify(newSettings)
      );
      setNotifications(newSettings);
    } catch (error) {
      console.log('Failed to save settings');
    }
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/welcome');
  };

  // const handleShare = () => {

  //   alert('Invite Friends\n\nShare Chit Chat AI with your friends!');
  // };

  const notificationSettings: SettingItem[] = [
    {
      icon: Bell,
      title: 'Push Notifications',
      subtitle: 'Receive notifications for new messages',
      showSwitch: true,
      switchValue: notifications.push,
      onSwitchChange: (value) =>
        saveNotificationSettings({ ...notifications, push: value }),
    },
  ];

  const appearanceSettings: SettingItem[] = [
    {
      icon: isDark ? Moon : Sun,
      title: 'Dark Mode',
      subtitle: 'Toggle between light and dark theme',
      showSwitch: true,
      switchValue: isDark,
      onSwitchChange: toggleTheme,
    },
  ];

  const otherSettings: SettingItem[] = [
    {
      icon: Lock,
      title: 'Change Password',
      subtitle: 'Update your account password',
      onPress: () => router.push('/(tabs)/change-password' as any)
    },
    // {
    //   icon: Share,
    //   title: 'Invite Friends',
    //   subtitle: 'Share the app with others',
    //   onPress: handleShare,
    // },
    {
      icon: LogOut,
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: () => setShowLogoutModal(true),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.settingItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
      onPress={item.onPress}
      disabled={item.showSwitch}
    >
      <View style={styles.settingLeft}>
        <item.icon size={24} color={colors.primary} strokeWidth={2} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: colors.textSecondary }]}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.showSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={32} color={colors.background} strokeWidth={2} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          <View
            style={[styles.settingsGroup, { backgroundColor: colors.surface }]}
          >
            {notificationSettings.map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <View
            style={[styles.settingsGroup, { backgroundColor: colors.surface }]}
          >
            {appearanceSettings.map(renderSettingItem)}
          </View>
        </View>
{/* About Section */}
<View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

  <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={toggleAbout}
    >
      <View style={styles.settingLeft}>
        <Info size={24} color={colors.primary} strokeWidth={2} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>About ChitChat AI</Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>App usage, features & team</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {showAbout ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>

    {showAbout && (
      <View style={{ padding: 16 }}>
        <Text style={[styles.settingSubtitle, { color: colors.text, fontWeight: 'bold' }]}>
          About ChitChat AI
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 6 }]}>
          Welcome to <Text style={{ fontWeight: 'bold' }}>ChitChat AI</Text> — a multi-user mobile application powered by artificial intelligence.{"\n"}
          It enhances your group conversations with smart AI interactions while keeping things simple for users.
        </Text>

        <Text style={[styles.settingSubtitle, { color: colors.text, fontWeight: 'bold', marginTop: 14 }]}>
          🔸 How to Use the App
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 4 }]}>
          <Text style={{ fontWeight: 'bold' }}>Talk to the AI:</Text> {"\n"}
          Use <Text style={{ fontWeight: 'bold' }}>@ai</Text> to interact with the AI.{"\n"}
          Example: <Text style={{ fontStyle: 'italic' }}>@ai What is machine learning?</Text>{"\n"}
          Without <Text style={{ fontWeight: 'bold' }}>@ai</Text>, the AI won’t respond.
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>Request Summaries:</Text> {"\n"}
          Want a summary of past chats? Just type:{"\n"}
          <Text style={{ fontStyle: 'italic' }}>@ai summary 1</Text> — for 1-day summary{"\n"}
          <Text style={{ fontStyle: 'italic' }}>@ai summary 2</Text> — for 2 days, and so on.
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>Simple Group Chat:</Text>{"\n"}
          Chat freely without using AI by just messaging normally.
        </Text>
          <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>Create Groups & Add Members:</Text>{"\n"}
          Only registered users can create groups.{"\n"}
          Members can only be added using their registered email.{"\n"}
          There should be a minimum of 2 users to create a group.
        </Text>


        <Text style={[styles.settingSubtitle, { color: colors.text, fontWeight: 'bold', marginTop: 14 }]}>
          Context-Aware AI (What Makes It Different):
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 4 }]}>
          Unlike most other apps like Meta, ChitChat AI <Text style={{ fontWeight: 'bold' }}>remembers the full conversation context</Text>.{"\n"}
          This ensures responses are accurate, relevant, and feel like a real conversation.
        </Text>

        <Text style={[styles.settingSubtitle, { color: colors.text, fontWeight: 'bold', marginTop: 14 }]}>
          🔸 Developed By
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 4 }]}>
          ChitChat AI was developed by:{"\n"}
          • Anum Tariq{"\n"}
          • Sajjad Ali{"\n"}
          • Taha Ali{"\n"}
          • Yasir Ali
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.text, marginTop: 8 }]}>
          This project was completed as part of the <Text style={{ fontWeight: 'bold' }}>Folio3 Summer Internship Program</Text>{"\n"}
          under the mentorship of <Text style={{ fontWeight: 'bold' }}>Talha Tahir</Text>.
        </Text>
      </View>
    )}
  </View>
</View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Other
          </Text>
          <View
            style={[styles.settingsGroup, { backgroundColor: colors.surface }]}
          >
            {otherSettings.map(renderSettingItem)}
          </View>
        </View>
      </ScrollView>

      {/* 🔥 Logout Confirmation Modal */}
    {/* 🔥 Logout Confirmation Modal - Old UI Restored */}
<Modal visible={showLogoutModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          Confirm Logout
        </Text>
        <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
          <X size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.modalText, { color: colors.textSecondary }]}>
        Are you sure you want to log out of your account?
      </Text>

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.border }]}
          onPress={() => setShowLogoutModal(false)}
        >
          <Text style={[styles.modalButtonText, { color: colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogoutConfirm}
        >
          <Text
            style={[styles.modalButtonText, { color: colors.background }]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsGroup: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalText: {
    fontSize: 15,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  aboutBox: {
  marginHorizontal: 16,
  marginTop: 8,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E0E0E0', // light border
  elevation: 2, // Android shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3, // iOS shadow
},
aboutText: {
  fontSize: 14,
  lineHeight: 22,
  textAlign: 'left',
},

});
