import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  subtitle, 
  buttonText, 
  onButtonPress 
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {Icon && (
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Icon size={48} color={colors.textSecondary} strokeWidth={1.5} />
        </View>
      )}
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      
      {buttonText && onButtonPress && (
        <Button
          title={buttonText}
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    minWidth: 160,
  },
});