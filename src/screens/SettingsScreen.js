// SettingsScreen.js — COM PERFIL DO USUÁRIO (nome + foto)

import React, { useState } from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  Modal, 
  TextInput,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useGroup } from '../context/GroupContext';
import { useTranslate } from '../hooks/useTranslate';
import Toast from '../components/Toast';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslate();
  const { language, changeLanguage } = useLanguage();
  const { userProfile, updateName, updateAvatar, clearAvatar } = useUser();
  const { currentUser, leaveGroup } = useGroup();
  const { 
    soundEnabled, 
    setSoundEnabled, 
    setCustomCategories,
    exportData, 
    importData, 
    clearAllData, 
    categories,
    customCategories,
    addCustomCategory,
  } = useApp();
  const { colors, darkMode, toggleDarkMode } = useTheme();

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Modal de categorias
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('pricetag');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');

  // Modal de idioma
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Modal de perfil
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);

  const iconOptions = [
    'pricetag', 'car', 'home', 'heart', 'school', 'game-controller', 'airplane', 'gift',
    'restaurant', 'bag', 'fitness', 'bus', 'phone-portrait', 'wifi', 'water', 'flame'
  ];

  const colorOptions = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E'
  ];

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  // ✅ PICKER DE FOTO — CORRIGIDO (sem MediaTypeOptions)
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permissão de acesso à galeria negada', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // ✅ CORRIGIDO: array de strings
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        updateAvatar(result.assets[0].uri);
        showToast('Foto atualizada!');
      }
    } catch (e) {
      showToast('Erro ao selecionar foto', 'error');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permissão de câmera negada', 'error');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        updateAvatar(result.assets[0].uri);
        showToast('Foto atualizada!');
      }
    } catch (e) {
      showToast('Erro ao tirar foto', 'error');
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert(
      'Foto de Perfil',
      'Escolha uma opção',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePhoto },
        userProfile.avatar && { 
          text: 'Remover Foto', 
          style: 'destructive',
          onPress: () => {
            clearAvatar();
            showToast('Foto removida', 'warning');
          }
        },
      ].filter(Boolean)
    );
  };

  const handleSaveName = () => {
    if (!editName.trim()) {
      showToast('Digite um nome válido', 'error');
      return;
    }
    updateName(editName.trim());
    setProfileModalVisible(false);
    showToast('Nome atualizado!');
  };

  // ... (handleExport, handleImport, handleClearData, handleAddCategory, handleResetCategories permanecem iguais)

  const handleExport = async () => {
    try {
      const data = await exportData();
      const fileUri = FileSystem.documentDirectory + `financas_pro_backup_${new Date().toISOString().slice(0,10)}.json`;
      await FileSystem.writeAsStringAsync(fileUri, data);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      showToast(t('settings.dataExported'));
    } catch (e) {
      showToast(t('settings.errorExport'), 'error');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const success = await importData(fileContent);

      if (success) {
        showToast(t('settings.dataImported'));
      } else {
        showToast(t('settings.errorImport'), 'error');
      }
    } catch (e) {
      showToast(t('settings.errorImport'), 'error');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ ' + t('settings.clearConfirm'),
      '',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('settings.clear'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('settings.clearSure'),
              t('settings.clearUndone'),
              [
                { text: t('cancel'), style: 'cancel' },
                {
                  text: t('confirm'),
                  style: 'destructive',
                  onPress: async () => {
                    // Se estiver em um grupo, sair primeiro (remove shared_items e membership)
                    if (currentUser && leaveGroup) {
                      await leaveGroup();
                    }
                    clearAllData();
                    showToast(t('settings.dataCleared'), 'warning');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      showToast(t('settings.enterCategoryName'), 'error');
      return;
    }

    addCustomCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor,
    });

    setNewCatName('');
    setNewCatIcon('pricetag');
    setNewCatColor('#8B5CF6');
    setCatModalVisible(false);
    showToast(t('settings.categoryAdded'));
  };

  const handleResetCategories = () => {
    Alert.alert(
      t('settings.resetCategories'),
      t('settings.resetConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: () => {
            setCustomCategories([]);
            showToast(t('settings.categoryReset'), 'warning');
          }
        }
      ]
    );
  };

  const toggleSound = (key) => {
    setSoundEnabled({ ...soundEnabled, [key]: !soundEnabled[key] });
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLangModalVisible(false);
    showToast(`Idioma alterado para ${LANGUAGES.find(l => l.code === lang)?.name}`);
  };

  const currentLang = LANGUAGES.find(l => l.code === language);

  const SettingRow = ({ icon, iconColor, iconBg, label, value, onPress, isSwitch, switchValue, onSwitchChange, danger }) => (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: colors.bgCard }]}
      onPress={onPress}
      activeOpacity={isSwitch ? 1 : 0.7}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg || colors.bgTertiary }]}>
          <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
        </View>
        <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.textPrimary }]}>
          {label}
        </Text>
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E2E8F0', true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : value ? (
        <Text style={[styles.rowValue, { color: colors.textMuted }]}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={danger ? colors.danger : colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header customizado */}
      <View style={[styles.header, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          <Ionicons name="settings" size={20} color={colors.primary} />  {t('settings.title')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingTop: 16 }}
      >
        {/* ✅ PROFILE CARD ELABORADO */}
        <TouchableOpacity 
          style={[styles.profileCard, { backgroundColor: colors.primary }]}
          onPress={() => {
            setEditName(userProfile.name);
            setProfileModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.profileAvatarContainer}>
            {userProfile.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatarImage} />
            ) : (
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraBtn}
              onPress={handlePhotoOptions}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileEmail}>@{currentUser?.username || 'Convidado'}</Text>
            <View style={styles.editHint}>
              <Ionicons name="create-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.editHintText}>Toque para editar</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* Aparência */}
        <Section title={t('settings.appearance')}>
          <SettingRow
            icon={darkMode ? 'sunny' : 'moon'}
            iconColor={colors.primary}
            label={t('settings.darkMode')}
            isSwitch
            switchValue={darkMode}
            onSwitchChange={toggleDarkMode}
          />
        </Section>

        {/* Idioma */}
        <Section title={t('settings.language')}>
          <SettingRow
            icon="language"
            iconColor={colors.primary}
            label={t('settings.selectLanguage')}
            value={`${currentLang?.flag} ${currentLang?.name}`}
            onPress={() => setLangModalVisible(true)}
          />
        </Section>

        {/* Sons */}
        <Section title={t('settings.sounds')}>
          <SettingRow
            icon="musical-notes"
            iconColor="#10B981"
            label={t('settings.soundAdd')}
            isSwitch
            switchValue={soundEnabled.add}
            onSwitchChange={() => toggleSound('add')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="trash"
            iconColor="#EF4444"
            label={t('settings.soundDelete')}
            isSwitch
            switchValue={soundEnabled.delete}
            onSwitchChange={() => toggleSound('delete')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="notifications"
            iconColor="#F59E0B"
            label={t('settings.soundNotif')}
            isSwitch
            switchValue={soundEnabled.notif}
            onSwitchChange={() => toggleSound('notif')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="trophy"
            iconColor="#8B5CF6"
            label={t('settings.soundAchievement')}
            isSwitch
            switchValue={soundEnabled.achievement}
            onSwitchChange={() => toggleSound('achievement')}
          />
        </Section>

        {/* Categorias */}
        <Section title={t('settings.categories')}>
          <SettingRow
            icon="add-circle"
            iconColor="#10B981"
            label={t('settings.addCategory')}
            onPress={() => setCatModalVisible(true)}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="refresh"
            iconColor={colors.danger}
            iconBg="rgba(239,68,68,0.1)"
            label={t('settings.resetCategories')}
            danger
            onPress={handleResetCategories}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.row, { backgroundColor: colors.bgCard }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: colors.bgTertiary }]}>
                <Ionicons name="list" size={20} color={colors.textMuted} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                {t('settings.currentCategories')}
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textMuted }]}>
              {categories.length}
            </Text>
          </View>
        </Section>

        {/* Dados */}
        <Section title={t('settings.data')}>
          <SettingRow
            icon="download"
            iconColor="#3B82F6"
            label={t('settings.export')}
            onPress={handleExport}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="upload"
            iconColor="#10B981"
            label={t('settings.import')}
            onPress={handleImport}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="trash"
            iconColor={colors.danger}
            iconBg="rgba(239,68,68,0.1)"
            label={t('settings.clearAll')}
            danger
            onPress={handleClearData}
          />
        </Section>

        {/* Sobre */}
        <Section title={t('settings.about')}>
          <SettingRow
            icon="information-circle"
            iconColor={colors.textMuted}
            label={t('appName')}
            value={t('version')}
          />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ✅ MODAL DE PERFIL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                <Ionicons name="person" size={20} color={colors.primary} />  Editar Perfil
              </Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Preview da foto */}
              <View style={styles.avatarPreviewContainer}>
                {userProfile.avatar ? (
                  <Image source={{ uri: userProfile.avatar }} style={styles.avatarPreview} />
                ) : (
                  <View style={[styles.avatarPreview, { backgroundColor: colors.primary }]}>
                    <Ionicons name="person" size={40} color="#FFFFFF" />
                  </View>
                )}
                <TouchableOpacity 
                  style={[styles.changePhotoBtn, { backgroundColor: colors.primary }]}
                  onPress={handlePhotoOptions}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.changePhotoText}>Alterar Foto</Text>
                </TouchableOpacity>
              </View>

              {/* Username da conta */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Usuário da Conta</Text>
                <View style={[styles.input, { backgroundColor: colors.bgTertiary + '80' }]}>
                  <Text style={{ color: colors.textMuted, fontSize: 15, paddingVertical: 12 }}>
                    @{currentUser?.username || 'Não vinculado'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                  {currentUser ? 'Vinculado ao grupo' : 'Faça login em Grupos para vincular'}
                </Text>
              </View>

              {/* Nome */}
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="Seu nome de exibição"
                  placeholderTextColor={colors.textMuted}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveName}
              >
                <Ionicons name="save" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Salvar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Selecionar Idioma */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                <Ionicons name="language" size={20} color={colors.primary} />  {t('settings.selectLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langOption,
                    { backgroundColor: language === lang.code ? colors.primary + '15' : colors.bgTertiary },
                    language === lang.code && { borderColor: colors.primary }
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                      {lang.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                      {lang.code.toUpperCase()}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Adicionar Categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={catModalVisible}
        onRequestClose={() => setCatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                <Ionicons name="add-circle" size={20} color="#10B981" />  {t('settings.addCategory')}
              </Text>
              <TouchableOpacity onPress={() => setCatModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.categoryName')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="Ex: Viagem"
                  placeholderTextColor={colors.textMuted}
                  value={newCatName}
                  onChangeText={setNewCatName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.categoryIcon')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScroll}>
                  {iconOptions.map(icon => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconChip,
                        { backgroundColor: newCatIcon === icon ? newCatColor + '20' : colors.bgTertiary },
                        newCatIcon === icon && { borderColor: newCatColor }
                      ]}
                      onPress={() => setNewCatIcon(icon)}
                    >
                      <Ionicons name={icon} size={20} color={newCatIcon === icon ? newCatColor : colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('settings.categoryColor')}</Text>
                <View style={styles.colorGrid}>
                  {colorOptions.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        newCatColor === color && styles.colorSelected
                      ]}
                      onPress={() => setNewCatColor(color)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#10B981' }]}
                onPress={handleAddCategory}
              >
                <Ionicons name="save" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>{t('settings.saveCategory')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },
  
  // ✅ PROFILE CARD ELABORADO
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileAvatar: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  profileAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editHintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  sectionCard: { borderRadius: 16, overflow: 'hidden' },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginLeft: 64 },
  
  // ✅ MODAL DE PERFIL
  avatarPreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { padding: 12, borderRadius: 12, fontSize: 15, borderWidth: 2, borderColor: 'transparent' },
  iconScroll: { paddingVertical: 4, gap: 8 },
  iconChip: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: 'transparent',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8 
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  colorCircle: { width: 40, height: 40, borderRadius: 20 },
  colorSelected: { borderWidth: 3, borderColor: '#1E293B', transform: [{ scale: 1.1 }] },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, marginTop: 8 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});

export default SettingsScreen;