// screens/RomaneioDetailsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { fetchRomaneioDetails } from '../api';
import RomaneioItemCard from '../components/RomaneioItemCard';
import AnimatedButton from '../components/common/AnimatedButton';
import * as SystemUI from 'expo-system-ui';
import { useFocusEffect } from '@react-navigation/native';

const RomaneioDetailsScreen = ({ route, navigation }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { romaneioId } = route.params; // Recebe o ID da tela anterior

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            SystemUI.setBackgroundColorAsync(colors.background);
        }, [colors])
    );

    useEffect(() => {
        loadDetails();
    }, [romaneioId]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const data = await fetchRomaneioDetails(romaneioId);
            setDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPeso = (val) => val ? `${val.toString().replace('.', ',')} kg` : '-';

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !details) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: colors.text }}>Erro ao carregar detalhes: {error}</Text>
                <AnimatedButton onPress={loadDetails} style={styles.retryButton}>
                    <Text style={styles.retryText}>Tentar Novamente</Text>
                </AnimatedButton>
            </View>
        );
    }

    // Separação dos itens
    const notasProprias = details.produtos.filter(p => p.tipo === 'O');
    const notasTerceiros = details.produtos.filter(p => p.tipo !== 'O');

    return (
        <View style={styles.container}>
            {/* Header Fixo com Botão Voltar */}
            <View style={styles.navHeader}>
                <AnimatedButton onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </AnimatedButton>
                <Text style={styles.navTitle}>Detalhes do Romaneio</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Cartão de Resumo (Topo) */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View>
                            <Text style={styles.label}>ROMANEIO</Text>
                            <Text style={styles.romaneioBig}>#{details.fechamento}</Text>
                        </View>
                        <View style={styles.dateBadge}>
                            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                            <Text style={styles.dateText}>{details.data}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Ionicons name="person" size={16} color={colors.textLight} />
                        <Text style={styles.infoText}>{details.motorista}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="bus" size={16} color={colors.textLight} />
                        <Text style={styles.infoText}>{details.veiculo}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PLACA</Text>
                            <Text style={styles.statValue}>{details.placa}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PESO TOTAL</Text>
                            <Text style={styles.statValue}>{formatPeso(details.peso_total)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>PALETES</Text>
                            <Text style={styles.statValue}>{details.paletes}</Text>
                        </View>
                    </View>
                </View>

                {/* Seção Notas Próprias */}
                {notasProprias.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas Próprias</Text>
                        {notasProprias.map((item, index) => (
                            <RomaneioItemCard key={`propria-${index}`} item={item} />
                        ))}
                    </View>
                )}

                {/* Seção Notas de Terceiros */}
                {notasTerceiros.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas de Terceiros</Text>
                        {notasTerceiros.map((item, index) => (
                            <RomaneioItemCard key={`terceiro-${index}`} item={item} />
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    navHeader: {
        backgroundColor: colors.primary,
        paddingTop: 50, // Status bar area
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    navTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    scrollContent: {
        padding: 15,
    },
    // Estilos do Cartão de Resumo
    summaryCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 10,
        color: colors.textLight,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    romaneioBig: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.primary,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        padding: 8,
        borderRadius: 8,
        gap: 6,
    },
    dateText: {
        fontWeight: 'bold',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        backgroundColor: colors.inputBackground,
        padding: 15,
        borderRadius: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: colors.textLight,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    // Estilos das Seções
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        paddingLeft: 5,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 8,
    },
    retryText: {
        color: colors.white,
        fontWeight: 'bold',
    }
});

export default RomaneioDetailsScreen;