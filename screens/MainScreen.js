// screens/MainScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import ProfilePanel from '../components/ProfilePanel';
import AnimatedButton from '../components/common/AnimatedButton';

const MainScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    
    const [isPanelVisible, setPanelVisible] = useState(false);

    const handleLogout = () => {
        setPanelVisible(false);
        logout();
    };

    useFocusEffect(
        useCallback(() => {
            const setSystemUIColor = async () => {
                await SystemUI.setBackgroundColorAsync(colors.background);
            };
            setSystemUIColor();
        }, [colors])
    );

    return (
        <View style={styles.container}>
            <ProfilePanel 
                visible={isPanelVisible}
                onClose={() => setPanelVisible(false)}
                onLogout={handleLogout}
            />
            
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Zenith Base</Text>

                    <AnimatedButton style={styles.profileButton} onPress={() => setPanelVisible(true)}>
                        <Ionicons name="person-circle-outline" size={32} color={colors.headerIcon} />
                    </AnimatedButton>
                </View>
            </View>

            <View style={styles.content}>
                {/* Área de conteúdo vazia */}
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        padding: SIZES.padding,
        paddingTop: 50, // Ajuste para status bar
        zIndex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    profileButton: {
        padding: 5,
    },
    content: {
        flex: 1,
        backgroundColor: colors.background,
    }
});

export default MainScreen;