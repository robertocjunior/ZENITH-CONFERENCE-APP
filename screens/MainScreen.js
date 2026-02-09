// screens/MainScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, Keyboard } from 'react-native'; // 1. Importado Keyboard
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import ProfilePanel from '../components/ProfilePanel';
import AnimatedButton from '../components/common/AnimatedButton';
import RomaneioCard from '../components/RomaneioCard';
import { fetchRomaneios } from '../api';

const LAST_SEARCH_KEY = '@zenith_last_search_date';

const MainScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    
    const [isPanelVisible, setPanelVisible] = useState(false);
    const [dateInput, setDateInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [romaneios, setRomaneios] = useState([]);

    useEffect(() => {
        const loadLastSearch = async () => {
            try {
                const savedDate = await AsyncStorage.getItem(LAST_SEARCH_KEY);
                if (savedDate) {
                    setDateInput(savedDate);
                    performSearch(savedDate);
                }
            } catch (error) {
                console.log("Erro ao recuperar última busca:", error);
            }
        };

        loadLastSearch();
    }, []);

    const handleLogout = () => {
        setPanelVisible(false);
        logout();
    };

    const formatDataInput = (text) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
        if (cleaned.length > 4) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
        setDateInput(formatted);
    };

    const performSearch = async (dateToSearch) => {
        setLoading(true);
        try {
            const data = await fetchRomaneios(dateToSearch);
            setRomaneios(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (dateInput.length !== 10) return;
        
        // 2. Fecha o teclado ao iniciar a busca
        Keyboard.dismiss();

        try {
            await AsyncStorage.setItem(LAST_SEARCH_KEY, dateInput);
        } catch (e) {
            console.warn("Falha ao salvar histórico de busca");
        }

        performSearch(dateInput);
    };

    useFocusEffect(
        useCallback(() => {
            SystemUI.setBackgroundColorAsync(colors.background);
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
                    <AnimatedButton onPress={() => setPanelVisible(true)}>
                        <Ionicons name="person-circle-outline" size={32} color={colors.white} />
                    </AnimatedButton>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="DD/MM/AAAA"
                        placeholderTextColor={colors.textLight}
                        keyboardType="numeric"
                        maxLength={10}
                        value={dateInput}
                        onChangeText={formatDataInput}
                        onSubmitEditing={handleSearch} // Permite buscar ao dar "Enter" no teclado
                    />
                    <AnimatedButton style={styles.searchButton} onPress={handleSearch}>
                        {loading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <Ionicons name="search" size={24} color={colors.white} />
                        )}
                    </AnimatedButton>
                </View>
            </View>

            <FlatList
                data={romaneios}
                keyExtractor={(item) => item.fechamento.toString()}
                renderItem={({ item }) => (
                    <RomaneioCard 
                        item={item} 
                        onPress={(selectedItem) => {
                            navigation.navigate('RomaneioDetails', { 
                                romaneioId: selectedItem.fechamento 
                            });
                        }} 
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading && <Text style={styles.emptyText}>Busque por uma data para listar romaneios.</Text>
                }
            />
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        padding: SIZES.padding,
        paddingTop: 50,
        zIndex: 1,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: SIZES.radius,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    searchButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 50,
        height: 50,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SIZES.padding,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textLight,
        marginTop: 40,
    }
});

export default MainScreen;