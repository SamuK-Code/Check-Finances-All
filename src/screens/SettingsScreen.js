import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { AppHeader, BackButton } from '../components/Navigation';
import { Toggle } from '../components/Forms';
import { Screen, SectionHeader, Divider, InfoRow } from '../components/Layout';
import { FadeIn } from '../components/Animations';

export default function SettingsScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useI18n();
  const { clearAllData } = useExpenses();
  const { logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      t('clearDataConfirm'),
      t('clearDataWarning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert(t('success'), t('dataCleared'));
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja sair da sua conta?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScreenLayout title={t('settings')}>
      <ScrollView contentContainerStyle={[styles.content, safeScrollPadding]}>
        {/* Language - agora abre modal */}
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.card }]}
          onPress={() => setShowLanguageModal(true)}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="language-outline" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{t('language')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {availableLanguages.find(l => l.code === language)?.name || language}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        {/* Theme */}
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={22} color={colors.secondary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{t('theme')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {isDark ? t('darkMode') : t('lightMode')}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isDark ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Sound */}
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="volume-high-outline" size={22} color={colors.info} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{t('sound')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {soundEnabled ? t('enabled') : t('disabled')}
              </Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Notifications */}
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="notifications-outline" size={22} color={colors.warning} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{t('notifications')}</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{t('soon')}</Text>
            </View>
          </View>
        </View>

        {/* Export Data */}
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="download-outline" size={22} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{t('export