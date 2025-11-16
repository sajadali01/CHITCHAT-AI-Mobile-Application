import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Toast from 'react-native-toast-message';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import * as SecureStore from 'expo-secure-store';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!oldPassword) errs.oldPassword = 'Old password is required.';
    if (!newPassword) errs.newPassword = 'New password is required.';
    if (newPassword && newPassword.length < 6)
      errs.newPassword = 'Password must be at least 6 characters.';
    if (!confirmPassword)
      errs.confirmPassword = 'Please confirm your new password.';
    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.34:5000/api'
        }/users/me/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.message || 'Failed to change password.' });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Password changed successfully!',
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        router.back();
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Change Password
        </Text>
        <Input
          label="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          error={errors.oldPassword}
          autoCapitalize="none"
        />
        <Input
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          error={errors.newPassword}
          autoCapitalize="none"
        />
        <Input
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
          autoCapitalize="none"
        />
        {errors.general && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors.general}
          </Text>
        )}
        <Button
          title={loading ? 'Changing...' : 'Done'}
          onPress={handleChangePassword}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 24 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    alignSelf: 'center',
  },
  error: {
    fontSize: 15,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
});
