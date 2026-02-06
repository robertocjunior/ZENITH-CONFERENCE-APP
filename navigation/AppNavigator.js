// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import RomaneioDetailsScreen from '../screens/RomaneioDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { authStatus, isLoading } = useAuth();
    const { colors } = useTheme();

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                    animation: 'fade', // Opcional
                }}
            >
                {authStatus === 'loggedIn' ? (
                    // GRUPO DE TELAS DE USUÁRIO LOGADO
                    // Usamos o Fragment (<> ... </>) para agrupar múltiplas telas
                    <>
                        <Stack.Screen name="Main" component={MainScreen} />
                        <Stack.Screen name="RomaneioDetails" component={RomaneioDetailsScreen} />
                    </>
                ) : authStatus === 'authenticating' ? (
                    <Stack.Screen name="Loading" component={LoadingScreen} />
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AppNavigator;