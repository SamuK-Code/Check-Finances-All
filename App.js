// App.js — Entry point com navegação por tabs/stacks e providers
// ATUALIZADO: ToastProvider adicionado, imports de componentes consolidados

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ═══════════════════════════════════════════════════════════
// CONTEXTS (ordem corrigida: GroupProvider antes de Cash/Expense/Planning)
// ═══════════════════════════════════════════════════════════
import { AuthProvider } from './src/contexts/AuthContext';
import { I18nProvider } from './src/contexts/I18nContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { GroupProvider } from './src/contexts/GroupContext';
import { CashProvider } from './src/contexts/CashContext';
import { ExpenseProvider } from './src/contexts/ExpenseContext';
import { PlanningProvider } from './src/contexts/PlanningContext';

// ═══════════════════════════════════════════════════════════
// COMPONENTS CONSOLIDADOS
// ═══════════════════════════════════════════════════════════
import { ToastProvider } from './src/components/Overlays';

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CardsScreen from './src/screens/CardsScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import EditExpenseScreen from './src/screens/EditExpenseScreen';
import ChartScreen from './src/screens/ChartScreen';
import ChartDetailScreen from './src/screens/ChartDetailScreen';
import PlanningScreen from './src/screens/PlanningScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import GroupScreen from './src/screens/GroupScreen';
import SyncScreen from './src/screens/SyncScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MoreScreen from './src/screens/MoreScreen';
import LanguageScreen from './src/screens/LanguageScreen';

// ═══════════════════════════════════════════════════════════
// NAVIGATION SETUP
// ═══════════════════════════════════════════════════════════
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para telas dentro das tabs
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
    <Stack.Screen name="ChartDetail" component={ChartDetailScreen} />
  </Stack.Navigator>
);

const CardsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CardsList" component={CardsScreen} />
  </Stack.Navigator>
);

const PlanningStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PlanningList" component={PlanningScreen} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HistoryList" component={HistoryScreen} />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreMenu" component={MoreScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="Group" component={GroupScreen} />
    <Stack.Screen name="Sync" component={SyncScreen} />
  </Stack.Navigator>
);

// Tab Navigator principal
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let icon;
        switch (route.name) {
          case 'Home': icon = focused ? '🏠' : '🏡'; break;
          case 'Cards': icon = focused ? '💳' : '💳'; break;
          case 'Planning': icon = focused ? '🎯' : '🎯'; break;
          case 'History': icon = focused ? '📜' : '📃'; break;
          case 'More': icon = focused ? '⚙️' : '🔧'; break;
          default: icon = '•';
        }
        return <Text style={{ fontSize: size }}>{icon}</Text>;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Cards" component={CardsStack} />
    <Tab.Screen name="Planning" component={PlanningStack} />
    <Tab.Screen name="History" component={HistoryStack} />
    <Tab.Screen name="More" component={MoreStack} />
  </Tab.Navigator>
);

// ═══════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════
const AppRoot = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <TabNavigator />
    </NavigationContainer>
  );
};

// ═══════════════════════════════════════════════════════════
// PROVIDERS TREE
// ═══════════════════════════════════════════════════════════
// ORDEM CORRETA: Auth → I18n → Theme → Group → Cash → Expense → Planning → Toast → AppRoot
// CashProvider, ExpenseProvider e PlanningProvider consomem useGroup()
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <I18nProvider>
          <ThemeProvider>
            <GroupProvider>
              <CashProvider>
                <ExpenseProvider>
                  <PlanningProvider>
                    <ToastProvider>
                      <AppRoot />
                    </ToastProvider>
                  </PlanningProvider>
                </ExpenseProvider>
              </CashProvider>
            </GroupProvider>
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
