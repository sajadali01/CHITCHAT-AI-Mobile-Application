import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Users, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme(); // ✅ Use theme

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MessageCircle size={60} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text }]}>Chit Chat AI</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Connect, chat, and collaborate with AI-powered group conversations
          </Text>
        </View>

        <View style={styles.features}>
          <View style={[styles.feature, { backgroundColor: colors.surface }]}>
            <Users size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureText, { color: colors.text }]}>Group Conversations</Text>
          </View>
          <View style={[styles.feature, { backgroundColor: colors.surface }]}>
            <Zap size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureText, { color: colors.text }]}>AI Assistant</Text>
          </View>
          <View style={[styles.feature, { backgroundColor: colors.surface }]}>
            <MessageCircle size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.featureText, { color: colors.text }]}>Real-time Chat</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={[styles.getStartedText, { color: colors.background }]}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    gap: 20,
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
